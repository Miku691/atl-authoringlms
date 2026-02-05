package com.ims.finance.repository;

import com.ims.finance.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, String> {
    List<Transaction> findAllByStudentIdAndTenantId(String studentId, String tenantId);

    List<Transaction> findAllByTenantId(String tenantId);
}
