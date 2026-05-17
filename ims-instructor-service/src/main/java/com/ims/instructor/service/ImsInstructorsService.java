package com.ims.instructor.service;

import com.ims.instructor.dto.ImsInstructorsDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ImsInstructorsService {
    ImsInstructorsDto create(ImsInstructorsDto dto);

    ImsInstructorsDto update(String id, ImsInstructorsDto dto);

    ImsInstructorsDto getById(String id);

    ImsInstructorsDto getByUserId(String userId);

    ImsInstructorsDto getByEmailAndTenantId(String email, String tenantId);

    Page<ImsInstructorsDto> getByTenant(String tenantId, Pageable pageable);

    Page<ImsInstructorsDto> getAll(Pageable pageable);

    void delete(String id);

    long countByTenant(String tenantId);

    void grantAccess(String id);

    long getTodayBirthdaysCount(String tenantId);
}

