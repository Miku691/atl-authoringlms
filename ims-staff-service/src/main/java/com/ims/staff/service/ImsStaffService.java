package com.ims.staff.service;

import com.ims.staff.dto.ImsStaffDto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ImsStaffService {
    ImsStaffDto create(ImsStaffDto dto);

    ImsStaffDto update(String id, ImsStaffDto dto);

    ImsStaffDto getById(String id);

    Page<ImsStaffDto> getByTenant(String tenantId, Pageable pageable);

    Page<ImsStaffDto> getAll(Pageable pageable);

    void delete(String id);

    void grantAccess(String id);
}