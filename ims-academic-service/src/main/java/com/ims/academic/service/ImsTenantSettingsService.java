package com.ims.academic.service;

import com.ims.academic.dto.ImsTenantSettingsDto;
import java.util.List;

public interface ImsTenantSettingsService {

    ImsTenantSettingsDto createOrUpdate(ImsTenantSettingsDto dto);

    ImsTenantSettingsDto getById(String tenantId);

    List<ImsTenantSettingsDto> getAll();

    void delete(String tenantId);
}
