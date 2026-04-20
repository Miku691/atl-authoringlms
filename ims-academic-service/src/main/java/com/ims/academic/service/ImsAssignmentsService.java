package com.ims.academic.service;

import com.ims.academic.dto.ImsAssignmentsDto;
import com.ims.academic.dto.StudentAssignmentSummaryDto;
import java.util.List;

public interface ImsAssignmentsService {

    ImsAssignmentsDto create(ImsAssignmentsDto dto);

    ImsAssignmentsDto update(String id, ImsAssignmentsDto dto);

    ImsAssignmentsDto getById(String id);

    List<ImsAssignmentsDto> getByOfferingId(String offeringId);

    com.ims.academic.dto.StudentAssignmentSummaryDto getStudentSummary(String offeringId, String studentId, String tenantId);

    void delete(String id);
}
