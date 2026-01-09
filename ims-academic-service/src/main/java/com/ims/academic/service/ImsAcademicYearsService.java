package com.ims.academic.service;

import com.ims.academic.dto.ImsAcademicYearsDto;

import java.util.List;

public interface ImsAcademicYearsService {

    ImsAcademicYearsDto create(ImsAcademicYearsDto dto);

    ImsAcademicYearsDto update(String id, ImsAcademicYearsDto dto);

    ImsAcademicYearsDto getById(String id);

    List<ImsAcademicYearsDto> getByTenantId(String tenantId);

    void delete(String id);
}
