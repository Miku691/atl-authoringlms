package com.ims.academic.repo;

import com.ims.academic.entity.ImsPrograms;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsProgramsRepo extends JpaRepository<ImsPrograms, String> {

    boolean existsByTenantIdAndCode(String tenantId, String code);
    java.util.Optional<ImsPrograms> findByTenantIdAndCode(String tenantId, String code);

    List<ImsPrograms> findByTenantId(String tenantId);

    long countByTenantId(String tenantId);
}
