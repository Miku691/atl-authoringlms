package com.ims.finance.repository;

import com.ims.finance.entity.FeeHead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FeeHeadRepository extends JpaRepository<FeeHead, String> {
    List<FeeHead> findAllByTenantId(String tenantId);

    boolean existsByTenantIdAndName(String tenantId, String name);

    Optional<FeeHead> findByTenantIdAndName(String tenantId, String name);
}
