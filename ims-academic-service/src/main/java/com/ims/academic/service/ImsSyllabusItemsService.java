package com.ims.academic.service;

import com.ims.academic.dto.ImsSyllabusItemsDto;

import java.util.List;

public interface ImsSyllabusItemsService {

    ImsSyllabusItemsDto create(ImsSyllabusItemsDto dto);

    ImsSyllabusItemsDto update(String id, ImsSyllabusItemsDto dto);

    ImsSyllabusItemsDto getById(String id);

    List<ImsSyllabusItemsDto> getByChapterId(String chapterId);

    void delete(String id);
}
