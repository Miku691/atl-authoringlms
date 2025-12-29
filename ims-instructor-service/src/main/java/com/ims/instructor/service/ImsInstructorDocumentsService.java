package com.ims.instructor.service;

import com.ims.instructor.dto.ImsInstructorDocumentsDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImsInstructorDocumentsService {

    ImsInstructorDocumentsDto uploadDocument(
            String instructorId,
            String documentType,
            MultipartFile file
    );

    List<ImsInstructorDocumentsDto> getByInstructor(String instructorId);
    ImsInstructorDocumentsDto getById(String id);
    void delete(String id);
}
