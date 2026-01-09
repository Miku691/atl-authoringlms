package com.ims.academic.controller;

import com.ims.academic.dto.ImsTenantSettingsDto;
import com.ims.academic.service.ImsTenantSettingsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("tenant-settings")
@RequiredArgsConstructor
public class ImsTenantSettingsController {

    private final ImsTenantSettingsService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsTenantSettingsDto>> createOrUpdate(@RequestBody ImsTenantSettingsDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsTenantSettingsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Tenant Settings saved successfully")
                        .apiData(service.createOrUpdate(dto))
                        .build());
    }

    @GetMapping("/{tenantId}")
    public ResponseEntity<ApiResponse<ImsTenantSettingsDto>> getById(@PathVariable String tenantId) {
        return ResponseEntity.ok(
                ApiResponse.<ImsTenantSettingsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Tenant Settings fetched successfully")
                        .apiData(service.getById(tenantId))
                        .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ImsTenantSettingsDto>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.<List<ImsTenantSettingsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("All Tenant Settings fetched successfully")
                        .apiData(service.getAll())
                        .build());
    }

    @DeleteMapping("/{tenantId}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String tenantId) {

        service.delete(tenantId);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Tenant Settings deleted successfully")
                        .apiData(null)
                        .build());
    }
}
