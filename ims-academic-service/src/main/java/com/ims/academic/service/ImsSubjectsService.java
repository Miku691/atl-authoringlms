package com.ims.academic.service;

import com.ims.academic.dto.ImsSubjectsDto;

import java.util.List;

public interface ImsSubjectsService {

    ImsSubjectsDto create(ImsSubjectsDto dto);

    ImsSubjectsDto getById(String id);

    List<ImsSubjectsDto> getAll();

    ImsSubjectsDto update(String id, ImsSubjectsDto dto);

    void delete(String id);
}
