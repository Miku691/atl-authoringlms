package com.ims.student.service.impl;

import com.ims.student.dto.ImsStudentDocumentsDto;
import com.ims.student.entity.ImsStudentDocuments;
import com.ims.student.entity.ImsStudents;
import com.ims.student.exception.ResourceNotFoundException;
import com.ims.student.repo.ImsStudentDocumentsRepo;
import com.ims.student.repo.ImsStudentsRepo;
import com.ims.student.service.ImsStudentDocumentsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsStudentDocumentsServiceImpl implements ImsStudentDocumentsService {

    private final ImsStudentDocumentsRepo repo;
    private final ImsStudentsRepo studentsRepo;
    private final ModelMapper modelMapper;

    @Value("${file.upload-dir:uploads}")
    private String baseUploadDir;

    @Override
    @Transactional
    public ImsStudentDocumentsDto upload(String studentId, String documentType, String tenantId, MultipartFile file) {

        studentsRepo.findById(studentId)
                .filter(s -> s.getTenantId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("Student ID", studentId));

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        try {
            // Storage Path: uploads/{tenantId}/students/{studentId}/{documentType}/
            String folderPath = new File(baseUploadDir).getAbsolutePath() + "/" + tenantId + "/students/" + studentId
                    + "/" + documentType;
            File folder = new File(folderPath);
            if (!folder.exists()) {
                boolean created = folder.mkdirs();
                if (!created) {
                    throw new IOException("Failed to create directory: " + folderPath);
                }
            }

            String filePath = folderPath + "/" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            File destFile = new File(filePath);
            file.transferTo(destFile);

            ImsStudentDocuments doc = ImsStudentDocuments.builder()
                    .studentId(studentId)
                    .tenantId(tenantId)
                    .documentType(documentType)
                    .fileUrl(destFile.getAbsolutePath())
                    .build();

            ImsStudentDocuments saved = repo.save(doc);

            // If it's a passport photo or profile image, update the student record with the SERVING URL
            if ("PROFILE_IMAGE".equalsIgnoreCase(documentType) || "PASSPORT_PHOTO".equalsIgnoreCase(documentType)) {
                ImsStudents student = studentsRepo.findById(studentId)
                        .orElseThrow(() -> new ResourceNotFoundException("Student ID", studentId));
                // URL Pattern: /ims-student-service/student-documents/view/{documentId}
                String viewUrl = "/ims-student-service/student-documents/view/" + saved.getId();
                student.setProfileImageUrl(viewUrl);
                studentsRepo.save(student);
            }

            return modelMapper.map(saved, ImsStudentDocumentsDto.class);

        } catch (IOException e) {
            e.printStackTrace(); // Log the error to console
            throw new RuntimeException("Error while uploading file: " + e.getMessage(), e);
        }
    }

    @Override
    public List<ImsStudentDocumentsDto> getByStudentId(String studentId, String tenantId) {
        return repo.findByStudentIdAndTenantId(studentId, tenantId)
                .stream()
                .map(doc -> modelMapper.map(doc, ImsStudentDocumentsDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public ImsStudentDocumentsDto getById(String id, String tenantId) {
        return repo.findById(id)
                .filter(doc -> doc.getTenantId().equals(tenantId))
                .map(doc -> modelMapper.map(doc, ImsStudentDocumentsDto.class))
                .orElseThrow(() -> new ResourceNotFoundException("Document ID", id));
    }

    @Override
    @Transactional
    public void delete(String id) {
        ImsStudentDocuments doc = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document ID", id));

        // Delete from FS
        File file = new File(doc.getFileUrl());
        if (file.exists()) {
            file.delete();
        }

        repo.delete(doc);
    }

    @Override
    public Resource getFileResource(String id) {
        ImsStudentDocuments doc = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document ID", id));

        try {
            Path filePath = Paths.get(doc.getFileUrl());
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read file: " + doc.getFileUrl());
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }
}
