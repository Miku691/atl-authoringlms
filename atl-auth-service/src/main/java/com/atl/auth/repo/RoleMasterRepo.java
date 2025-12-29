package com.atl.auth.repo;

import com.atl.auth.entity.RoleMaster;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleMasterRepo extends JpaRepository<RoleMaster, Long> {
    boolean existsByRoleCode(String roleCode);

    Optional<RoleMaster> findByRoleCode(String roleCode);
}
