package com.ims.academic.repo;

import com.ims.academic.entity.ImsAttendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ImsAttendanceRepo extends JpaRepository<ImsAttendance, String> {

    List<ImsAttendance> findByTenantId(String tenantId);

    List<ImsAttendance> findByOfferingIdAndDate(String offeringId, LocalDate date);

    List<ImsAttendance> findByStudentId(String studentId);

    Optional<ImsAttendance> findByStudentIdAndOfferingIdAndDateAndSubjectId(
            String studentId, String offeringId, LocalDate date, String subjectId);
}
