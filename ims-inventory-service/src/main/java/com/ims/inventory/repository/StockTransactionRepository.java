package com.ims.inventory.repository;

import com.ims.inventory.entity.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, String> {
    List<StockTransaction> findByTenantId(String tenantId);
    List<StockTransaction> findByTenantIdAndItemId(String tenantId, String itemId);
}
