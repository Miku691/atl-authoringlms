package com.ims.student.service.impl;



import com.ims.student.dto.ImsStudentDocumentsDto;
import com.ims.student.entity.ImsStudentDocuments;
import com.ims.student.exception.ResourceNotFoundException;
import com.ims.student.repo.ImsStudentDocumentsRepo;
import com.ims.student.repo.ImsStudentsRepo;
import com.ims.student.service.ImsStudentDocumentsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
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
    public ImsStudentDocumentsDto upload(String studentId, String documentType, MultipartFile file) {

        studentsRepo.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student ID", studentId));

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        try {
            String folderPath = baseUploadDir + "/students/" + studentId;
            File folder = new File(folderPath);
            if (!folder.exists()) folder.mkdirs();

            String filePath = folderPath + "/" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
            File destFile = new File(filePath);
            file.transferTo(destFile);

            ImsStudentDocuments doc = ImsStudentDocuments.builder()
                    .studentId(studentId)
                    .documentType(documentType)
                    .fileUrl(destFile.getAbsolutePath())
                    .build();

            ImsStudentDocuments saved = repo.save(doc);
            return modelMapper.map(saved, ImsStudentDocumentsDto.class);

        } catch (IOException e) {
            throw new RuntimeException("Error while uploading file");
        }
    }

    @Override
    public List<ImsStudentDocumentsDto> getByStudentId(String studentId) {
        return repo.findByStudentId(studentId)
                .stream()
                .map(doc -> modelMapper.map(doc, ImsStudentDocumentsDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public ImsStudentDocumentsDto getById(String id) {
        return repo.findById(id)
                .map(doc -> modelMapper.map(doc, ImsStudentDocumentsDto.class))
                .orElseThrow(() -> new ResourceNotFoundException("Document ID", id));
    }

    @Override
    public void delete(String id) {
        ImsStudentDocuments doc = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document ID", id));

        File file = new File(doc.getFileUrl());
        if (file.exists()) file.delete();

        repo.delete(doc);
    }
}
