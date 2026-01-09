package com.ims.academic.controller;

import com.ims.academic.dto.ImsClassesDto;
import com.ims.academic.service.ImsClassesService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("classes")
@RequiredArgsConstructor
public class ImsClassesController {

    private final ImsClassesService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsClassesDto>> create(@RequestBody ImsClassesDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsClassesDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Class created successfully")
                        .apiData(service.create(dto))
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsClassesDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsClassesDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Class fetched successfully")
                        .apiData(service.getById(id))
                        .build());
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<ImsClassesDto>>> getByTenant(
            @PathVariable String tenantId) {

        return ResponseEntity.ok(
                ApiResponse.<List<ImsClassesDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Classes fetched successfully")
                        .apiData(service.getByTenant(tenantId))
                        .build());
    }

    @GetMapping("/offering/{offeringId}")
    public ResponseEntity<ApiResponse<List<ImsClassesDto>>> getByOffering(
            @PathVariable String offeringId) {

        return ResponseEntity.ok(
                ApiResponse.<List<ImsClassesDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Classes fetched successfully")
                        .apiData(service.getByOffering(offeringId))
                        .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {

        service.delete(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Class deleted successfully")
                        .apiData(null)
                        .build());
    }
}
