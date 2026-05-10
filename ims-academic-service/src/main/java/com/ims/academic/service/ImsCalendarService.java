package com.ims.academic.service;

import com.ims.academic.dto.CalendarEventDto;
import com.ims.academic.dto.CalendarEventRequestDto;

import java.time.LocalDate;
import java.util.List;

/**
 * Service contract for the Operational Calendar.
 * Aggregates holidays, institute events, meetings, recurring class slots, and exam schedules
 * and exposes CRUD operations for manually managed events.
 */
public interface ImsCalendarService {

    /**
     * Returns a merged, role-filtered list of calendar events for the given date range.
     *
     * @param tenantId  tenant scope
     * @param startDate inclusive range start
     * @param endDate   inclusive range end
     * @param personId  studentId or instructorId (null for admin)
     * @param role      raw role string from JWT (will be normalised internally)
     */
    List<CalendarEventDto> getCalendarEvents(
            String tenantId, LocalDate startDate, LocalDate endDate,
            String personId, String role);

    /**
     * Creates a new institute event (HOLIDAY / EVENT / MEETING).
     *
     * @param tenantId  tenant scope
     * @param dto       event data from the request body
     * @return persisted event as DTO
     */
    CalendarEventDto createEvent(String tenantId, CalendarEventRequestDto dto);

    /**
     * Updates an existing institute event.
     *
     * @param tenantId tenant scope (used for ownership validation)
     * @param eventId  entity id of the ImsInstituteEvents record
     * @param dto      updated fields
     * @return updated event as DTO
     */
    CalendarEventDto updateEvent(String tenantId, String eventId, CalendarEventRequestDto dto);

    /**
     * Deletes an institute event.
     *
     * @param tenantId tenant scope
     * @param eventId  entity id
     */
    void deleteEvent(String tenantId, String eventId);

    /**
     * Returns a single institute event by id.
     */
    CalendarEventDto getEventById(String tenantId, String eventId);
}
