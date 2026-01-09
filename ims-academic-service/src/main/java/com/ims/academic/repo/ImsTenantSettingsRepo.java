package com.ims.academic.repo;

import com.ims.academic.entity.ImsTenantSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImsTenantSettingsRepo extends JpaRepository<ImsTenantSettings, String> {
}
