package com.ims.staff.service;

import com.ims.staff.dto.ImsStaffDocumentsDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImsStaffDocumentsService {

    ImsStaffDocumentsDto uploadDocument(
            String staffId,
            String documentType,
            MultipartFile file
    );

    List<ImsStaffDocumentsDto> getByStaff(String staffId);

    ImsStaffDocumentsDto getById(String id);

    void delete(String id);
}