package com.atl.auth.repo;

import com.atl.auth.entity.ImsTenants;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ImsTenantsRepo extends JpaRepository<ImsTenants, String> {
    boolean existsByTenantCode(String tenantCode);
}
