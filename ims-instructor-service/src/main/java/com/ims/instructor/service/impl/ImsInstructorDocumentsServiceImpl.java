package com.ims.instructor.service.impl;

import com.ims.instructor.dto.ImsInstructorDocumentsDto;
import com.ims.instructor.entity.ImsInstructorDocuments;
import com.ims.instructor.enums.DocumentType;
import com.ims.instructor.exception.ResourceNotFoundException;
import com.ims.instructor.repo.ImsInstructorDocumentsRepo;
import com.ims.instructor.repo.ImsInstructorsRepo;
import com.ims.instructor.service.ImsInstructorDocumentsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsInstructorDocumentsServiceImpl implements ImsInstructorDocumentsService {

    private final ImsInstructorDocumentsRepo repo;
    private final ImsInstructorsRepo instructorsRepo;
    private final ModelMapper modelMapper;

    private static final String UPLOAD_DIR = "D:/MIku/Doc/uploads/instructor-documents/";

    private ImsInstructorDocumentsDto toDto(ImsInstructorDocuments e) {
        return modelMapper.map(e, ImsInstructorDocumentsDto.class);
    }

    @Override
    public ImsInstructorDocumentsDto uploadDocument(String instructorId, String documentType, MultipartFile file) {

        // Instructor must exist
        instructorsRepo.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor ID", instructorId));

        // Convert document type
        DocumentType docType = DocumentType.valueOf(documentType.toUpperCase());

        // Create folder if missing
        File folder = new File(UPLOAD_DIR + instructorId);
        if (!folder.exists()) folder.mkdirs();

        String filePath = UPLOAD_DIR + instructorId + "/" + file.getOriginalFilename();

        try {
            file.transferTo(new File(filePath));
        } catch (IOException e) {
            throw new RuntimeException("File upload error: " + e.getMessage());
        }

        // Save record
        ImsInstructorDocuments doc = ImsInstructorDocuments.builder()
                .instructorId(instructorId)
                .documentType(docType)
                .fileUrl(filePath)
                .build();

        return toDto(repo.save(doc));
    }

    @Override
    public List<ImsInstructorDocumentsDto> getByInstructor(String instructorId) {
        return repo.findByInstructorId(instructorId)
                .stream().map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ImsInstructorDocumentsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Document ID", id));
    }

    @Override
    public void delete(String id) {
        ImsInstructorDocuments doc = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document ID", id));

        // delete local file
        File f = new File(doc.getFileUrl());
        if (f.exists()) f.delete();

        repo.delete(doc);
    }
}
