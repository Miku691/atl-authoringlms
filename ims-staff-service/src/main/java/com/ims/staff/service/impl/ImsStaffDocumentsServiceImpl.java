package com.ims.staff.service.impl;

import com.ims.staff.dto.ImsStaffDocumentsDto;
import com.ims.staff.entity.ImsStaffDocuments;
import com.ims.staff.enums.StaffDocumentType;
import com.ims.staff.exception.ResourceNotFoundException;
import com.ims.staff.repo.ImsStaffDocumentsRepo;
import com.ims.staff.repo.ImsStaffRepo;
import com.ims.staff.service.ImsStaffDocumentsService;
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
public class ImsStaffDocumentsServiceImpl implements ImsStaffDocumentsService {

    private final ImsStaffDocumentsRepo repo;
    private final ImsStaffRepo staffRepo;
    private final ModelMapper modelMapper;

    //private static final String UPLOAD_DIR = "uploads/staff-documents/";
    private static final String UPLOAD_DIR = "D:/MIku/Doc/uploads/staff-documents/";

    private ImsStaffDocumentsDto toDto(ImsStaffDocuments e) {
        return modelMapper.map(e, ImsStaffDocumentsDto.class);
    }

    @Override
    public ImsStaffDocumentsDto uploadDocument(
            String staffId,
            String documentType,
            MultipartFile file
    ) {

        // Validate staff
        staffRepo.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff ID", staffId));

        StaffDocumentType docType =
                StaffDocumentType.valueOf(documentType.toUpperCase());

        // Create directory
        File dir = new File(UPLOAD_DIR + staffId);
        if (!dir.exists()) dir.mkdirs();

        String filePath = UPLOAD_DIR + staffId + "/" + file.getOriginalFilename();

        try {
            file.transferTo(new File(filePath));
        } catch (IOException e) {
            throw new RuntimeException("File upload failed: " + e.getMessage());
        }

        ImsStaffDocuments entity = ImsStaffDocuments.builder()
                .staffId(staffId)
                .documentType(docType)
                .fileUrl(filePath)
                .build();

        return toDto(repo.save(entity));
    }

    @Override
    public List<ImsStaffDocumentsDto> getByStaff(String staffId) {

        staffRepo.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff ID", staffId));

        return repo.findByStaffId(staffId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ImsStaffDocumentsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Document ID", id));
    }

    @Override
    public void delete(String id) {

        ImsStaffDocuments doc = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document ID", id));

        // delete file
        File f = new File(doc.getFileUrl());
        if (f.exists()) f.delete();

        repo.delete(doc);
    }
}