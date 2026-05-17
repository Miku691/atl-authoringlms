package com.ims.academic.controller;

import com.ims.academic.dto.ImsAnnouncementDto;
import com.ims.academic.service.ImsAnnouncementService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for managing institutional announcements.
 */
@RestController
@RequestMapping("/announcements")
@RequiredArgsConstructor
public class ImsAnnouncementController {

    private final ImsAnnouncementService service;

    /**
     * Creates a new announcement.
     *
     * @param dto announcement details
     * @return created announcement data
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ImsAnnouncementDto>> create(@RequestBody ImsAnnouncementDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsAnnouncementDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Announcement created successfully")
                        .apiData(service.create(dto))
                        .build());
    }

    /**
     * Updates an existing announcement.
     *
     * @param id identifier of the announcement
     * @param dto updated announcement details
     * @return updated announcement data
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsAnnouncementDto>> update(@PathVariable String id, @RequestBody ImsAnnouncementDto dto) {
        return ResponseEntity.ok(
                ApiResponse.<ImsAnnouncementDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Announcement updated successfully")
                        .apiData(service.update(id, dto))
                        .build());
    }

    /**
     * Retrieves an announcement by its ID.
     *
     * @param id identifier of the announcement
     * @return announcement data
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsAnnouncementDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsAnnouncementDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Announcement fetched successfully")
                        .apiData(service.getById(id))
                        .build());
    }

    /**
     * Retrieves all announcements for a tenant.
     *
     * @param tenantId tenant identifier
     * @return list of announcements
     */
    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<ImsAnnouncementDto>>> getByTenantId(@PathVariable String tenantId) {
        return ResponseEntity.ok(
                ApiResponse.<List<ImsAnnouncementDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Announcements fetched successfully")
                        .apiData(service.getByTenantId(tenantId))
                        .build());
    }

    /**
     * Retrieves filtered announcements for a tenant.
     *
     * @param tenantId tenant identifier
     * @param audience target audience filter
     * @param priority priority filter
     * @param search search text filter
     * @return list of filtered announcements
     */
    @GetMapping("/tenant/{tenantId}/filter")
    public ResponseEntity<ApiResponse<List<ImsAnnouncementDto>>> getFiltered(
            @PathVariable String tenantId,
            @RequestParam(required = false) String audience,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(
                ApiResponse.<List<ImsAnnouncementDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Filtered announcements fetched successfully")
                        .apiData(service.getFilteredAnnouncements(tenantId, audience, priority, search))
                        .build());
    }

    /**
     * Retrieves active announcements for a specific audience.
     *
     * @param tenantId tenant identifier
     * @param audience target audience
     * @return list of active announcements
     */
    @GetMapping("/tenant/{tenantId}/active")
    public ResponseEntity<ApiResponse<List<ImsAnnouncementDto>>> getActive(
            @PathVariable String tenantId,
            @RequestParam String audience) {
        return ResponseEntity.ok(
                ApiResponse.<List<ImsAnnouncementDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Active announcements fetched successfully")
                        .apiData(service.getActiveByAudience(tenantId, audience))
                        .build());
    }

    /**
     * Deletes an announcement by its ID.
     *
     * @param id identifier of the announcement
     * @return confirmation response
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Announcement deleted successfully")
                        .apiData(null)
                        .build());
    }
}
