package com.ims.finance.repository;

import com.ims.finance.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findAllByStudentIdAndTenantId(String studentId, String tenantId);

    List<Transaction> findAllByTenantIdOrderByTransactionDateDesc(String tenantId);

    @Query("SELECT SUM(t.amount) FROM Transaction t WHERE t.tenantId = :tenantId AND t.transactionDate >= :startDate")
    BigDecimal sumAmountByTenantIdAndDateAfter(@Param("tenantId") String tenantId,
            @Param("startDate") LocalDateTime startDate);

    @Query("SELECT t.offeringId, SUM(t.amount) FROM Transaction t WHERE t.tenantId = :tenantId AND t.offeringId IS NOT NULL GROUP BY t.offeringId")
    List<Object[]> sumAmountByOffering(@Param("tenantId") String tenantId);

    @Query("SELECT FUNCTION('YEAR', t.transactionDate) as year, FUNCTION('MONTH', t.transactionDate) as month, SUM(t.amount) as amount " +
           "FROM Transaction t WHERE t.tenantId = :tenantId AND t.transactionDate >= :startDate " +
           "GROUP BY FUNCTION('YEAR', t.transactionDate), FUNCTION('MONTH', t.transactionDate)")
    List<Object[]> sumAmountByMonth(@Param("tenantId") String tenantId, @Param("startDate") LocalDateTime startDate);

    List<Transaction> findAllByTenantIdAndTransactionDateBetween(String tenantId, LocalDateTime start, LocalDateTime end);

    List<Transaction> findByTenantIdAndAcademicYear(String tenantId, String academicYear);
}
