package com.ims.academic.service;

import com.ims.academic.dto.ImsTimetableSlotsDto;
import java.util.List;

public interface ImsTimetableSlotsService {

    ImsTimetableSlotsDto create(ImsTimetableSlotsDto dto);

    ImsTimetableSlotsDto update(String id, ImsTimetableSlotsDto dto);

    ImsTimetableSlotsDto getById(String id);

    List<ImsTimetableSlotsDto> getByTimetableMasterId(String timetableMasterId);

    void delete(String id);
}
