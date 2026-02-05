package com.ims.academic.repo;

import com.ims.academic.entity.ImsAttendanceRecords;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsAttendanceRecordsRepo extends JpaRepository<ImsAttendanceRecords, String> {
    List<ImsAttendanceRecords> findByAttendanceMasterId(String attendanceMasterId);

    long countByPersonId(String personId);

    long countByPersonIdAndStatus(String personId, com.ims.academic.enums.AttendanceStatus status);

    void deleteByAttendanceMaster(com.ims.academic.entity.ImsAttendanceMaster master);

    java.util.List<ImsAttendanceRecords> findByPersonIdAndPersonType(String personId, String personType);

    java.util.List<ImsAttendanceRecords> findByPersonIdAndPersonTypeAndAttendanceMasterDateBetween(
            String personId, String personType, java.time.LocalDate start, java.time.LocalDate end);
}
