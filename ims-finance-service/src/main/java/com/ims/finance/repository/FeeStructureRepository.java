package com.ims.finance.repository;

import com.ims.finance.entity.FeeStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FeeStructureRepository extends JpaRepository<FeeStructure, String> {
    List<FeeStructure> findAllByTenantId(String tenantId);

    List<FeeStructure> findAllByOfferingIdAndTenantId(String offeringId, String tenantId);

    boolean existsByFeeHeadId(String feeHeadId);
}
