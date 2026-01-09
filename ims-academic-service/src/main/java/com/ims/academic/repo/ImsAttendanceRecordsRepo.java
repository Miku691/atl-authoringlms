package com.ims.academic.repo;

import com.ims.academic.entity.ImsAttendanceRecords;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsAttendanceRecordsRepo extends JpaRepository<ImsAttendanceRecords, String> {
    List<ImsAttendanceRecords> findByAttendanceMasterId(String attendanceMasterId);
}
