package com.ims.finance.repository;

import com.ims.finance.entity.FeeInstallmentSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeInstallmentScheduleRepository extends JpaRepository<FeeInstallmentSchedule, String> {
    List<FeeInstallmentSchedule> findByPlanIdAndTenantIdOrderByInstallmentNumberAsc(String planId, String tenantId);
    void deleteByPlanIdAndTenantId(String planId, String tenantId);
}
