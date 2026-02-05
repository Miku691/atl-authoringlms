package com.ims.academic.service;

import com.ims.academic.dto.DepartmentDto;
import java.util.List;

public interface DepartmentService {
    DepartmentDto create(DepartmentDto dto);

    DepartmentDto update(String id, DepartmentDto dto);

    DepartmentDto getById(String id);

    List<DepartmentDto> getByTenant(String tenantId);

    void delete(String id);
}
