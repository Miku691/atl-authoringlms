package com.ims.academic.repository;

import com.ims.academic.entity.ImsYears;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImsYearsRepository extends JpaRepository<ImsYears, String> {
    List<ImsYears> findByTenantId(String tenantId);
    List<ImsYears> findByTenantIdAndBranchId(String tenantId, String branchId);
}
