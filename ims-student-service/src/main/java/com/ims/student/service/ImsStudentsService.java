package com.ims.student.service;

import com.ims.student.dto.ImsStudentsDto;

import java.util.List;

public interface ImsStudentsService {
    ImsStudentsDto create(ImsStudentsDto dto);

    ImsStudentsDto update(String id, ImsStudentsDto dto);

    ImsStudentsDto getById(String id);

    List<ImsStudentsDto> getByTenant(String tenantId);

    List<ImsStudentsDto> getAll();

    void delete(String id);
}