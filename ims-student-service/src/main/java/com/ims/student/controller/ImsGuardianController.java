package com.ims.student.controller;

import com.ims.student.dto.ImsGuardiansDto;
import com.ims.student.service.ImsGuardiansService;
import com.ims.student.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing Master Guardian records.
 */
@RestController
@RequestMapping("/master-guardians")
@RequiredArgsConstructor
public class ImsGuardianController {

    private final ImsGuardiansService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsGuardiansDto>> create(@RequestBody ImsGuardiansDto dto) {
        ImsGuardiansDto saved = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsGuardiansDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Guardian created successfully")
                        .apiData(saved)
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsGuardiansDto>> update(@PathVariable String id,
            @RequestBody ImsGuardiansDto dto) {
        ImsGuardiansDto updated = service.update(id, dto);
        return ResponseEntity.ok(
                ApiResponse.<ImsGuardiansDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Guardian updated successfully")
                        .apiData(updated)
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsGuardiansDto>> getById(@PathVariable String id) {
        ImsGuardiansDto dto = service.getById(id);
        return ResponseEntity.ok(
                ApiResponse.<ImsGuardiansDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Guardian fetched successfully")
                        .apiData(dto)
                        .build());
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<ImsGuardiansDto>>> getByTenant(@PathVariable String tenantId) {
        List<ImsGuardiansDto> list = service.getByTenant(tenantId);
        return ResponseEntity.ok(
                ApiResponse.<List<ImsGuardiansDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Guardians fetched for tenant")
                        .apiData(list)
                        .build());
    }

    @GetMapping("/tenant/{tenantId}/search")
    public ResponseEntity<ApiResponse<ImsGuardiansDto>> searchByPhone(
            @PathVariable String tenantId,
            @RequestParam String phone) {
        ImsGuardiansDto dto = service.getByPhoneAndTenant(phone, tenantId);
        return ResponseEntity.ok(
                ApiResponse.<ImsGuardiansDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Guardian found")
                        .apiData(dto)
                        .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Guardian deleted successfully")
                        .apiData(null)
                        .build());
    }
}
