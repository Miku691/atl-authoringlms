package com.ims.finance.repository;

import com.ims.finance.entity.FeeDiscount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeeDiscountRepository extends JpaRepository<FeeDiscount, String> {
    List<FeeDiscount> findAllByTenantId(String tenantId);
}
