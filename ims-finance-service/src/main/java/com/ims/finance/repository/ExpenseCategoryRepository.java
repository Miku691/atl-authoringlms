package com.ims.finance.repository;

import com.ims.finance.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, String> {
    List<ExpenseCategory> findByTenantId(String tenantId);
    boolean existsByTenantIdAndName(String tenantId, String name);
}
