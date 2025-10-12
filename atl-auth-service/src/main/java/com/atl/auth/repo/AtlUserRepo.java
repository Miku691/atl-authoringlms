package com.atl.auth.repo;

import com.atl.auth.entity.AtlUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AtlUserRepo extends JpaRepository<AtlUser, Long> {
    Optional<AtlUser> findByUsername(String username);

    Optional<AtlUser> findByEmail(String email);
}