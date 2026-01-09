package com.ims.academic.service;

import com.ims.academic.dto.ImsClassesDto;

import java.util.List;

public interface ImsClassesService {

    ImsClassesDto create(ImsClassesDto dto);

    ImsClassesDto update(String id, ImsClassesDto dto);

    ImsClassesDto getById(String id);

    List<ImsClassesDto> getByTenant(String tenantId);

    List<ImsClassesDto> getByOffering(String offeringId);

    void delete(String id);
}