package com.atl.auth.repo;

import com.atl.auth.entity.AtlUser;
import com.atl.auth.entity.UserTenantRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTenantRoleRepo extends JpaRepository<UserTenantRole, Long> {
    List<UserTenantRole> findByUser(AtlUser user);

    // Find roles for a user in a specific tenant
    List<UserTenantRole> findByUserAndTenant_Id(AtlUser user, String tenantId);

    // Check if user has a role in a tenant
    boolean existsByUserAndTenant_IdAndRole_RoleName(AtlUser user, String tenantId, String roleName);
}
