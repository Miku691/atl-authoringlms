package com.ims.academic.service;

import com.ims.academic.dto.ImsOfferingInstructorsDto;

import java.util.List;

public interface ImsOfferingInstructorsService {

    ImsOfferingInstructorsDto create(ImsOfferingInstructorsDto dto);

    ImsOfferingInstructorsDto update(String id, ImsOfferingInstructorsDto dto);

    ImsOfferingInstructorsDto getById(String id);

    List<ImsOfferingInstructorsDto> getByOfferingId(String offeringId);

    List<ImsOfferingInstructorsDto> getByInstructorId(String instructorId);

    void delete(String id);
}
