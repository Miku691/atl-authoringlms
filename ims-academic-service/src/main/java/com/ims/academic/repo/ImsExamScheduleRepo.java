package com.ims.academic.repo;

import com.ims.academic.entity.ImsExamSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImsExamScheduleRepo extends JpaRepository<ImsExamSchedule, String> {

    List<ImsExamSchedule> findByExamMasterId(String examMasterId);

    List<ImsExamSchedule> findByOfferingIdAndTenantId(String offeringId, String tenantId);

    List<ImsExamSchedule> findByExamMasterIdAndOfferingId(String examMasterId, String offeringId);

    List<ImsExamSchedule> findByExamMasterIdAndSubjectId(String examMasterId, String subjectId);

    List<ImsExamSchedule> findByTenantIdAndExamDateBetween(String tenantId, java.time.LocalDate start, java.time.LocalDate end);
}
