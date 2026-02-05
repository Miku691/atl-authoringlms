package com.ims.academic.controller;

import com.ims.academic.dto.ImsAnnouncementDto;
import com.ims.academic.service.ImsAnnouncementService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/announcements")
@RequiredArgsConstructor
public class ImsAnnouncementController {

    private final ImsAnnouncementService service;

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
