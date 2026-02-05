package com.ims.academic.service;

import com.ims.academic.dto.ImsAnnouncementDto;
import java.util.List;

public interface ImsAnnouncementService {
    ImsAnnouncementDto create(ImsAnnouncementDto dto);

    ImsAnnouncementDto getById(String id);

    List<ImsAnnouncementDto> getByTenantId(String tenantId);

    List<ImsAnnouncementDto> getActiveByAudience(String tenantId, String audience);

    void delete(String id);
}
