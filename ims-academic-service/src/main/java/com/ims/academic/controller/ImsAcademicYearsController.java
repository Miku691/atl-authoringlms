package com.ims.academic.controller;

import com.ims.academic.dto.ImsAcademicYearsDto;
import com.ims.academic.service.ImsAcademicYearsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("academic-years")
@RequiredArgsConstructor
public class ImsAcademicYearsController {

    private final ImsAcademicYearsService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsAcademicYearsDto>> create(@RequestBody ImsAcademicYearsDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsAcademicYearsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Academic Year created successfully")
                        .apiData(service.create(dto))
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsAcademicYearsDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsAcademicYearsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Academic Year fetched successfully")
                        .apiData(service.getById(id))
                        .build());
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<ImsAcademicYearsDto>>> getByTenantId(
            @PathVariable String tenantId) {

        return ResponseEntity.ok(
                ApiResponse.<List<ImsAcademicYearsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Academic Years fetched successfully")
                        .apiData(service.getByTenantId(tenantId))
                        .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {

        service.delete(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Academic Year deleted successfully")
                        .apiData(null)
                        .build());
    }
}
