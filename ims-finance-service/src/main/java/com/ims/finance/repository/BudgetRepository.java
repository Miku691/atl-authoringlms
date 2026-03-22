package com.ims.finance.repository;

import com.ims.finance.entity.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, String> {
    List<Budget> findByTenantIdAndAcademicYear(String tenantId, String academicYear);
    Optional<Budget> findByCategoryIdAndAcademicYearAndTenantId(String categoryId, String academicYear, String tenantId);
}
