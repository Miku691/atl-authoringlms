package com.ims.finance.repository;

import com.ims.finance.entity.StudentFeeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentFeeRecordRepository extends JpaRepository<StudentFeeRecord, String> {
    List<StudentFeeRecord> findAllByStudentIdAndTenantId(String studentId, String tenantId);

    List<StudentFeeRecord> findAllByTenantId(String tenantId);

    boolean existsByStudentIdAndFeeHeadIdAndOfferingIdAndAcademicYear(String studentId, String feeHeadId,
            String offeringId, String academicYear);

    java.util.Optional<StudentFeeRecord> findByStudentIdAndFeeHeadIdAndAcademicYearAndTenantId(String studentId,
            String feeHeadId,
            String academicYear, String tenantId);
}
