package com.atl.auth.repo;

import com.atl.auth.entity.AtlRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AtlRoleRepo extends JpaRepository<AtlRole, Long> {
    Optional<AtlRole> findByRoleName(String defaultRole);
}
