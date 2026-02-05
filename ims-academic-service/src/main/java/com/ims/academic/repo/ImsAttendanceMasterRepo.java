package com.ims.academic.repo;

import com.ims.academic.entity.ImsAttendanceMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ImsAttendanceMasterRepo extends JpaRepository<ImsAttendanceMaster, String> {
    List<ImsAttendanceMaster> findByOfferingId(String offeringId);

    List<ImsAttendanceMaster> findByOfferingIdAndDate(String offeringId, LocalDate date);

    Optional<ImsAttendanceMaster> findByOfferingIdAndDateAndSubjectId(String offeringId, LocalDate date,
            String subjectId);

    Optional<ImsAttendanceMaster> findByTenantIdAndOfferingIdAndDateAndSubjectId(String tenantId, String offeringId,
            LocalDate date, String subjectId);

    Optional<ImsAttendanceMaster> findByTenantIdAndDateAndOfferingIdIsNull(String tenantId, LocalDate date);
}
