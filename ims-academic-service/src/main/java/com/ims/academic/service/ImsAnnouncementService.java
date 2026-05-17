package com.ims.academic.service;

import com.ims.academic.dto.ImsAnnouncementDto;
import java.util.List;

public interface ImsAnnouncementService {
    /**
     * Creates a new announcement.
     *
     * @param dto announcement details
     * @return created announcement data
     */
    ImsAnnouncementDto create(ImsAnnouncementDto dto);

    /**
     * Updates an existing announcement.
     *
     * @param id identifier of the announcement
     * @param dto updated announcement details
     * @return updated announcement data
     */
    ImsAnnouncementDto update(String id, ImsAnnouncementDto dto);

    /**
     * Retrieves an announcement by its ID.
     *
     * @param id identifier of the announcement
     * @return announcement data
     */
    ImsAnnouncementDto getById(String id);

    /**
     * Retrieves all announcements for a tenant.
     *
     * @param tenantId tenant identifier
     * @return list of announcements
     */
    List<ImsAnnouncementDto> getByTenantId(String tenantId);

    /**
     * Retrieves filtered announcements for a tenant.
     *
     * @param tenantId tenant identifier
     * @param audience target audience filter
     * @param priority priority filter
     * @param search search text filter
     * @return list of filtered announcements
     */
    List<ImsAnnouncementDto> getFilteredAnnouncements(String tenantId, String audience, String priority, String search);

    /**
     * Retrieves active announcements for a specific audience.
     *
     * @param tenantId tenant identifier
     * @param audience target audience
     * @return list of active announcements
     */
    List<ImsAnnouncementDto> getActiveByAudience(String tenantId, String audience);

    /**
     * Deletes an announcement by its ID.
     *
     * @param id identifier of the announcement
     */
    void delete(String id);
}
