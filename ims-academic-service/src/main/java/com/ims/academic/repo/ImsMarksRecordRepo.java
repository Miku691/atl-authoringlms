package com.ims.academic.repo;

import com.ims.academic.entity.ImsMarksRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImsMarksRecordRepo extends JpaRepository<ImsMarksRecord, String> {

    List<ImsMarksRecord> findByExamScheduleId(String examScheduleId);

    List<ImsMarksRecord> findByStudentIdAndTenantId(String studentId, String tenantId);

    Optional<ImsMarksRecord> findByExamScheduleIdAndStudentId(String examScheduleId, String studentId);
}
