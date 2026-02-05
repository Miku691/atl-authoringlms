package com.ims.academic.service;

import com.ims.academic.dto.AttendanceBatchRequestDto;
import com.ims.academic.dto.AttendanceRecordDto;
import com.ims.academic.dto.MessageDto;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {

    MessageDto markBulkAttendance(String tenantId, AttendanceBatchRequestDto request);

    List<AttendanceRecordDto> getAttendanceByOfferingAndDate(String offeringId, LocalDate date);

    List<AttendanceRecordDto> getStudentAttendance(String studentId);

    List<AttendanceRecordDto> getAttendanceByTenantAndDate(String tenantId, LocalDate date);

    com.ims.academic.dto.AttendanceSummaryDto getMonthlyStats(String personId, String personType, int month, int year);

    MessageDto updateIndividualRecord(String tenantId, String id, AttendanceRecordDto recordDto);
}
