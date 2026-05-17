package com.ims.student.service;

import com.ims.student.dto.ImsStudentsDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface ImsStudentsService {
    ImsStudentsDto create(ImsStudentsDto dto);

    ImsStudentsDto update(String id, ImsStudentsDto dto);

    ImsStudentsDto getById(String id);

    List<ImsStudentsDto> getByTenant(String tenantId);

    List<ImsStudentsDto> getAll();

    void delete(String id);

    ImsStudentsDto getStudentByUserId(String userId);

    ImsStudentsDto getStudentByEmailAndTenantId(String email, String tenantId);

    long countByTenant(String tenantId);

    void grantAccess(String id);

    List<Map<String, Object>> getGenderStats(String tenantId);

    Page<ImsStudentsDto> searchStudents(String tenantId, String gender,
                                        String offeringId, String searchTerm, Pageable pageable);

    List<ImsStudentsDto> getByOffering(String tenantId, String offeringId);

    List<ImsStudentsDto> getByInstructorId(String instructorId, String tenantId);

    long getTodayBirthdaysCount(String tenantId);
}