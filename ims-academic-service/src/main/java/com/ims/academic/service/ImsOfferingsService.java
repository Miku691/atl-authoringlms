package com.ims.academic.service;

import com.ims.academic.dto.ImsOfferingsDto;

import java.util.List;

public interface ImsOfferingsService {

    ImsOfferingsDto create(ImsOfferingsDto dto);

    ImsOfferingsDto update(String id, ImsOfferingsDto dto);

    ImsOfferingsDto getById(String id);

    List<ImsOfferingsDto> getByTenant(String tenantId);

    List<ImsOfferingsDto> getByProgram(String programId);

    void delete(String id);
}
