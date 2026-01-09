package com.ims.academic.service;

import com.ims.academic.dto.ImsChaptersDto;

import java.util.List;

public interface ImsChaptersService {

    ImsChaptersDto create(ImsChaptersDto dto);

    ImsChaptersDto update(String id, ImsChaptersDto dto);

    ImsChaptersDto getById(String id);

    List<ImsChaptersDto> getBySyllabusPackId(String syllabusPackId);

    void delete(String id);
}
