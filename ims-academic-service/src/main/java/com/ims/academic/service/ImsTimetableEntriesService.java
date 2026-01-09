package com.ims.academic.service;

import com.ims.academic.dto.ImsTimetableEntriesDto;
import java.util.List;

public interface ImsTimetableEntriesService {

    ImsTimetableEntriesDto create(ImsTimetableEntriesDto dto);

    ImsTimetableEntriesDto update(String id, ImsTimetableEntriesDto dto);

    ImsTimetableEntriesDto getById(String id);

    List<ImsTimetableEntriesDto> getByTimetableSlotId(String timetableSlotId);

    void delete(String id);
}
