package com.ims.staff.controller;

import com.ims.staff.dto.ImsStaffDto;
import com.ims.staff.service.ImsStaffService;
import com.ims.staff.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@RestController
@RequestMapping("/staff")
@RequiredArgsConstructor
public class ImsStaffController {

    private final ImsStaffService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsStaffDto>> create(@RequestBody ImsStaffDto dto) {
        ImsStaffDto saved = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsStaffDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Staff created successfully")
                        .apiData(saved)
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsStaffDto>> update(
            @PathVariable String id,
            @RequestBody ImsStaffDto dto) {

        ImsStaffDto updated = service.update(id, dto);
        return ResponseEntity.ok(
                ApiResponse.<ImsStaffDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Staff updated successfully")
                        .apiData(updated)
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsStaffDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsStaffDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Staff fetched successfully")
                        .apiData(service.getById(id))
                        .build());
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<Page<ImsStaffDto>>> getByTenant(
            @PathVariable String tenantId,
            Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.<Page<ImsStaffDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Staff fetched successfully")
                        .apiData(service.getByTenant(tenantId, pageable))
                        .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ImsStaffDto>>> getAll(Pageable pageable) {
        return ResponseEntity.ok(
                ApiResponse.<Page<ImsStaffDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("All staff fetched")
                        .apiData(service.getAll(pageable))
                        .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Staff deleted successfully")
                        .apiData(null)
                        .build());
    }

    @PostMapping("/{id}/grant-access")
    public ResponseEntity<ApiResponse<Void>> grantAccess(@PathVariable String id) {
        service.grantAccess(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Access granted successfully")
                        .apiData(null)
                        .build());
    }
}
