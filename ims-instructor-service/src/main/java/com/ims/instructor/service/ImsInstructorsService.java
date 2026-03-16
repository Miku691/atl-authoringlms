package com.ims.instructor.service;

import com.ims.instructor.dto.ImsInstructorsDto;

import java.util.List;

public interface ImsInstructorsService {
    ImsInstructorsDto create(ImsInstructorsDto dto);

    ImsInstructorsDto update(String id, ImsInstructorsDto dto);

    ImsInstructorsDto getById(String id);

    ImsInstructorsDto getByUserId(String userId);

    ImsInstructorsDto getByEmailAndTenantId(String email, String tenantId);

    List<ImsInstructorsDto> getByTenant(String tenantId);

    List<ImsInstructorsDto> getAll();

    void delete(String id);

    long countByTenant(String tenantId);

    void grantAccess(String id);
}
