package com.ims.student.service;

import com.ims.student.dto.ImsStudentEnrollmentsDto;
import com.ims.student.dto.StudentAcademicHistoryDto;
import com.ims.student.dto.StudentSummaryDto;
import com.ims.student.dto.BulkPromotionDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ImsStudentEnrollmentsService {
    ImsStudentEnrollmentsDto create(ImsStudentEnrollmentsDto dto);

    ImsStudentEnrollmentsDto update(String id, ImsStudentEnrollmentsDto dto);

    ImsStudentEnrollmentsDto getById(String id);

    List<ImsStudentEnrollmentsDto> getByStudentId(String studentId);

    List<ImsStudentEnrollmentsDto> getAll();

    void delete(String id);

    Page<StudentSummaryDto> getStudentsByOffering(String offeringId, String status, String tenantId, Pageable pageable);

    List<StudentAcademicHistoryDto> getAcademicHistory(String studentId);

    java.util.List<java.util.Map<String, Object>> getOfferingStats(String tenantId);

    /**
     * Bulk promotes students to a new offering for a new academic year.
     * 
     * @param dto Bulk promotion details
     * @param tenantId Tenant ID for security context
     */
    void bulkPromote(BulkPromotionDto dto, String tenantId);
}