package com.atl.auth.repo;

import com.atl.auth.entity.AtlUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AtlUserRepo extends JpaRepository<AtlUser, Long> {
}
