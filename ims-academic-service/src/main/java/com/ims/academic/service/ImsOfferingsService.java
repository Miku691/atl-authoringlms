package com.ims.academic.service;

import com.ims.academic.dto.ImsOfferingsDto;

import java.util.List;

public interface ImsOfferingsService {

    ImsOfferingsDto create(ImsOfferingsDto dto);

    ImsOfferingsDto update(String id, ImsOfferingsDto dto);

    ImsOfferingsDto getById(String id);

    List<ImsOfferingsDto> getByTenant(String tenantId);

    List<ImsOfferingsDto> getByProgram(String programId);

    List<ImsOfferingsDto> getByInstructor(String instructorId);

    void delete(String id);

    ImsOfferingsDto activate(String id);

    ImsOfferingsDto deactivate(String id);

    com.ims.academic.dto.InstructorAssignmentDto assignInstructor(com.ims.academic.dto.InstructorAssignmentDto dto);

    com.ims.academic.dto.CoverageStatusDto getCoverageStatus(String offeringId);

    java.util.List<ImsOfferingsDto> getByIds(java.util.List<String> ids);

    boolean hasActiveOfferings(String tenantId);

    long countByTenant(String tenantId);
}
