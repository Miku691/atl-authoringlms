package com.ims.finance.repository;

import com.ims.finance.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.time.LocalDate;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, String> {
    List<Expense> findByTenantId(String tenantId);

    @Query("SELECT FUNCTION('YEAR', e.expenseDate) as year, FUNCTION('MONTH', e.expenseDate) as month, SUM(e.amount) as amount " +
           "FROM Expense e WHERE e.tenantId = :tenantId AND e.expenseDate >= :startDate " +
           "GROUP BY FUNCTION('YEAR', e.expenseDate), FUNCTION('MONTH', e.expenseDate)")
    List<Object[]> sumAmountByMonth(@Param("tenantId") String tenantId, @Param("startDate") LocalDate startDate);
}
