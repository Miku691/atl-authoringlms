package com.ims.academic.service;

import com.ims.academic.dto.ImsAssignmentsDto;
import java.util.List;

public interface ImsAssignmentsService {

    ImsAssignmentsDto create(ImsAssignmentsDto dto);

    ImsAssignmentsDto update(String id, ImsAssignmentsDto dto);

    ImsAssignmentsDto getById(String id);

    List<ImsAssignmentsDto> getByOfferingId(String offeringId);

    void delete(String id);
}
