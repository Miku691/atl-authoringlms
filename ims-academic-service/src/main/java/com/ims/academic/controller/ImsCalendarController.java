package com.ims.academic.controller;

import com.ims.academic.dto.CalendarEventDto;
import com.ims.academic.dto.CalendarEventRequestDto;
import com.ims.academic.service.ImsCalendarService;
import com.ims.academic.util.ApiResponse;
// import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller for the Operational Calendar.
 *
 * <p>
 * Read endpoint is accessible to all authenticated users.
 * CRUD endpoints are restricted by role — see individual method docs.
 */
@RestController
@RequestMapping("calendar")
@RequiredArgsConstructor
public class ImsCalendarController {

    private final ImsCalendarService service;

    /**
     * Returns a merged, role-filtered calendar event list for the given date range.
     *
     * @param tenantId  tenant scope (required)
     * @param startDate range start in ISO date format (yyyy-MM-dd)
     * @param endDate   range end in ISO date format (yyyy-MM-dd)
     * @param personId  optional student or instructor profile ID for class lookups
     * @param role      optional raw role string from the client (normalised
     *                  internally)
     */
    @GetMapping("/summary")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<CalendarEventDto>>> getCalendarSummary(
            @RequestParam String tenantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String personId,
            @RequestParam(required = false) String role) {

        List<CalendarEventDto> events = service.getCalendarEvents(tenantId, startDate, endDate, personId, role);
        return ResponseEntity
                .ok(ApiResponse.success(HttpStatus.OK.value(), "Calendar events fetched successfully", events));
    }

    /**
     * Returns a single institute event by its entity id.
     *
     * @param tenantId tenant scope
     * @param eventId  entity id of the ImsInstituteEvents record
     */
    @GetMapping("/events/{eventId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CalendarEventDto>> getEvent(
            @RequestParam String tenantId,
            @PathVariable String eventId) {

        CalendarEventDto dto = service.getEventById(tenantId, eventId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Event fetched", dto));
    }

    /**
     * Creates a new institute calendar event (HOLIDAY / EVENT / MEETING).
     * Admins may create all types; instructors may only create MEETING events.
     *
     * @param tenantId tenant scope (from query param or header)
     * @param dto      event details
     * @param auth     injected security context used to derive createdBy
     */
    @PostMapping("/events")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN','SUPER_ADMIN','INSTRUCTOR')")
    public ResponseEntity<ApiResponse<CalendarEventDto>> createEvent(
            @RequestParam String tenantId,
            @RequestBody CalendarEventRequestDto dto,
            Authentication auth) {

        dto.setCreatedBy(auth.getName());
        CalendarEventDto created = service.createEvent(tenantId, dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED.value(), "Event created successfully", created));
    }

    /**
     * Updates an existing institute calendar event.
     * Only admins may update; instructors can update their own MEETING events
     * (fine-grained check in service).
     *
     * @param tenantId tenant scope
     * @param eventId  entity id of the event to update
     * @param dto      updated fields
     */
    @PutMapping("/events/{eventId}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN','SUPER_ADMIN','INSTRUCTOR')")
    public ResponseEntity<ApiResponse<CalendarEventDto>> updateEvent(
            @RequestParam String tenantId,
            @PathVariable String eventId,
            @RequestBody CalendarEventRequestDto dto) {

        CalendarEventDto updated = service.updateEvent(tenantId, eventId, dto);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Event updated successfully", updated));
    }

    /**
     * Deletes an institute calendar event.
     *
     * @param tenantId tenant scope
     * @param eventId  entity id
     */
    @DeleteMapping("/events/{eventId}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN','SUPER_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(
            @RequestParam String tenantId,
            @PathVariable String eventId) {

        service.deleteEvent(tenantId, eventId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Event deleted successfully", null));
    }
}
