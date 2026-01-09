package com.ims.academic.service;

import com.ims.academic.dto.ImsOfferingSubjectsDto;

import java.util.List;

public interface ImsOfferingSubjectsService {

    ImsOfferingSubjectsDto create(ImsOfferingSubjectsDto dto);

    ImsOfferingSubjectsDto update(String id, ImsOfferingSubjectsDto dto);

    ImsOfferingSubjectsDto getById(String id);

    List<ImsOfferingSubjectsDto> getByOfferingId(String offeringId);

    void delete(String id);
}
