package com.ims.academic.service;

import com.ims.academic.dto.ImsSectionsDto;

import java.util.List;

public interface ImsSectionsService {

    ImsSectionsDto create(ImsSectionsDto dto);

    ImsSectionsDto update(String id, ImsSectionsDto dto);

    ImsSectionsDto getById(String id);

    List<ImsSectionsDto> getByClass(String classId);

    List<ImsSectionsDto> getByTenant(String tenantId);

    void delete(String id);
}