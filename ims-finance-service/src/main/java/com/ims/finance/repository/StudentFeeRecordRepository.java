package com.ims.finance.repository;

import com.ims.finance.entity.StudentFeeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.math.BigDecimal;

@Repository
public interface StudentFeeRecordRepository extends JpaRepository<StudentFeeRecord, String> {
    List<StudentFeeRecord> findAllByStudentIdAndTenantId(String studentId, String tenantId);

    List<StudentFeeRecord> findAllByTenantId(String tenantId);

    boolean existsByStudentIdAndFeeHeadIdAndOfferingIdAndAcademicYear(String studentId, String feeHeadId,
            String offeringId, String academicYear);

    java.util.Optional<StudentFeeRecord> findByStudentIdAndFeeHeadIdAndAcademicYearAndTenantId(String studentId,
            String feeHeadId,
            String academicYear, String tenantId);

    boolean existsByStudentIdAndInstallmentScheduleId(String studentId, String installmentScheduleId);

    List<StudentFeeRecord> findByStatusInAndLateFeeAppliedFalseAndDueDateBefore(List<StudentFeeRecord.FeeStatus> statuses, java.time.LocalDate date);

    List<StudentFeeRecord> findByTenantIdAndStatusInAndDueDateBefore(String tenantId, List<StudentFeeRecord.FeeStatus> statuses, java.time.LocalDate date);
    
    List<StudentFeeRecord> findByTenantIdAndOfferingIdAndStatusInAndDueDateBefore(String tenantId, String offeringId, List<StudentFeeRecord.FeeStatus> statuses, java.time.LocalDate date);

    List<StudentFeeRecord> findByTenantIdAndBalanceGreaterThan(String tenantId, BigDecimal balance);

    List<StudentFeeRecord> findByTenantIdAndAcademicYear(String tenantId, String academicYear);

    boolean existsByFeeHeadId(String feeHeadId);

    @Query("SELECT SUM(s.balance) FROM StudentFeeRecord s WHERE s.tenantId = :tenantId")
    BigDecimal sumTotalBalance(@Param("tenantId") String tenantId);

    @Query("SELECT s.feeHeadId, SUM(s.amountPaid) FROM StudentFeeRecord s WHERE s.tenantId = :tenantId GROUP BY s.feeHeadId")
    List<Object[]> sumPaidByFeeHead(@Param("tenantId") String tenantId);

    @Query("SELECT SUM(s.balance) FROM StudentFeeRecord s WHERE s.studentId = :studentId AND s.academicYear = :year AND s.tenantId = :tenantId")
    BigDecimal sumBalanceByStudentAndYear(@Param("studentId") String studentId, @Param("year") String year, @Param("tenantId") String tenantId);
}
