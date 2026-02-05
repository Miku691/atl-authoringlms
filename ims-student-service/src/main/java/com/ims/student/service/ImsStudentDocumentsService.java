package com.ims.student.service;

import com.ims.student.dto.ImsStudentDocumentsDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ImsStudentDocumentsService {

    ImsStudentDocumentsDto upload(String studentId, String documentType, String tenantId, MultipartFile file);

    List<ImsStudentDocumentsDto> getByStudentId(String studentId, String tenantId);

    ImsStudentDocumentsDto getById(String id, String tenantId);

    void delete(String id);

    org.springframework.core.io.Resource getFileResource(String id);
}
