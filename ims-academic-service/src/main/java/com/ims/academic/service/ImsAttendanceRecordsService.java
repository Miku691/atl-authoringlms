package com.ims.academic.service;

import com.ims.academic.dto.AttendanceSummaryDto;
import com.ims.academic.dto.ImsAttendanceRecordsDto;
import java.util.List;

public interface ImsAttendanceRecordsService {

    ImsAttendanceRecordsDto create(ImsAttendanceRecordsDto dto);

    ImsAttendanceRecordsDto update(String id, ImsAttendanceRecordsDto dto);

    ImsAttendanceRecordsDto getById(String id);

    List<ImsAttendanceRecordsDto> getByAttendanceMasterId(String attendanceMasterId);

    void delete(String id);

    AttendanceSummaryDto getSummaryByStudentId(String studentId);
}
