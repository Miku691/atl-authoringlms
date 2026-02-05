package com.ims.finance.repository;

import com.ims.finance.entity.LateFeeRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LateFeeRuleRepository extends JpaRepository<LateFeeRule, String> {
    List<LateFeeRule> findAllByTenantId(String tenantId);
}
