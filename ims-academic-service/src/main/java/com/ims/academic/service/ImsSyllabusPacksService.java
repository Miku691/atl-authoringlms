package com.ims.academic.service;

import com.ims.academic.dto.ImsSyllabusPacksDto;

import java.util.List;

public interface ImsSyllabusPacksService {

    ImsSyllabusPacksDto create(ImsSyllabusPacksDto dto);

    ImsSyllabusPacksDto update(String id, ImsSyllabusPacksDto dto);

    ImsSyllabusPacksDto getById(String id);

    List<ImsSyllabusPacksDto> getByTenantId(String tenantId);

    void delete(String id);
}
