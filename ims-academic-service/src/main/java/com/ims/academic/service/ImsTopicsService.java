package com.ims.academic.service;

import com.ims.academic.dto.ImsTopicsDto;
import java.util.List;

public interface ImsTopicsService {
    ImsTopicsDto create(ImsTopicsDto dto);

    ImsTopicsDto update(String id, ImsTopicsDto dto);

    ImsTopicsDto getById(String id);

    List<ImsTopicsDto> getByChapterId(String chapterId);

    void delete(String id);
}
