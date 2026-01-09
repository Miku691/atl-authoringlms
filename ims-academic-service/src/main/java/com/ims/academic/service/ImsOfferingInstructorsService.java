package com.ims.academic.service;

import com.ims.academic.dto.ImsOfferingInstructorsDto;

import java.util.List;

public interface ImsOfferingInstructorsService {

    ImsOfferingInstructorsDto create(ImsOfferingInstructorsDto dto);

    ImsOfferingInstructorsDto update(String id, ImsOfferingInstructorsDto dto);

    ImsOfferingInstructorsDto getById(String id);

    List<ImsOfferingInstructorsDto> getByOfferingId(String offeringId);

    void delete(String id);
}
