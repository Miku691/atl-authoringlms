package com.ims.student.service;

import com.ims.student.dto.ImsStudentDocumentsDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImsStudentDocumentsService {

    ImsStudentDocumentsDto upload(String studentId, String documentType, MultipartFile file);
    List<ImsStudentDocumentsDto> getByStudentId(String studentId);
    ImsStudentDocumentsDto getById(String id);
    void delete(String id);
}
