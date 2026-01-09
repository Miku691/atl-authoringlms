package com.ims.academic.repo;

import com.ims.academic.entity.ImsAttendanceMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ImsAttendanceMasterRepo extends JpaRepository<ImsAttendanceMaster, String> {
    List<ImsAttendanceMaster> findByOfferingId(String offeringId);

    List<ImsAttendanceMaster> findByOfferingIdAndDate(String offeringId, LocalDate date);
}
