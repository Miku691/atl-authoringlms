package com.ims.academic.service;

import com.ims.academic.dto.ImsMarksRecordDto;

import java.util.List;

public interface ImsMarksService {

    // Bulk marks entry/update
    void saveBulkMarks(String examScheduleId, List<ImsMarksRecordDto> marksList, String tenantId);

    // Get marks for a specific scheduled exam paper
    List<ImsMarksRecordDto> getMarksBySchedule(String examScheduleId);

    // Get full report card of a student
    List<ImsMarksRecordDto> getResultsByStudent(String studentId, String tenantId);

    // Individual marks entry
    ImsMarksRecordDto saveIndividualMark(ImsMarksRecordDto markDto);
}
