package com.ims.academic.service;

import com.ims.academic.dto.ImsAttendanceMasterDto;
import java.time.LocalDate;
import java.util.List;

public interface ImsAttendanceMasterService {

    ImsAttendanceMasterDto create(ImsAttendanceMasterDto dto);

    ImsAttendanceMasterDto update(String id, ImsAttendanceMasterDto dto);

    ImsAttendanceMasterDto getById(String id);

    List<ImsAttendanceMasterDto> getByOfferingId(String offeringId);

    List<ImsAttendanceMasterDto> getByOfferingIdAndDate(String offeringId, LocalDate date);

    void delete(String id);
}
