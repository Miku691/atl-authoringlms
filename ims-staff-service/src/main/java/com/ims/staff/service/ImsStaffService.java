package com.ims.staff.service;

import com.ims.staff.dto.ImsStaffDto;

import java.util.List;

public interface ImsStaffService {
    ImsStaffDto create(ImsStaffDto dto);
    ImsStaffDto update(String id, ImsStaffDto dto);
    ImsStaffDto getById(String id);
    List<ImsStaffDto> getByTenant(String tenantId);
    List<ImsStaffDto> getAll();
    void delete(String id);
}