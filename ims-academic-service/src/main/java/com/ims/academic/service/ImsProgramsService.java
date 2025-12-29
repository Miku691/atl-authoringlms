package com.ims.academic.service;

import com.ims.academic.dto.ImsProgramsDto;

import java.util.List;

public interface ImsProgramsService {

    ImsProgramsDto create(ImsProgramsDto dto);

    ImsProgramsDto update(String id, ImsProgramsDto dto);

    ImsProgramsDto getById(String id);

    List<ImsProgramsDto> getByTenant(String tenantId);

    List<ImsProgramsDto> getAll();

    void delete(String id);
}
