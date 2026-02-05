package com.ims.academic.controller;

import com.ims.academic.dto.ImsSectionsDto;
import com.ims.academic.service.ImsSectionsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("sections")
@RequiredArgsConstructor
public class ImsSectionsController {

    private final ImsSectionsService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsSectionsDto>> create(@RequestBody ImsSectionsDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsSectionsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Section created successfully")
                        .apiData(service.create(dto))
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsSectionsDto>> update(@PathVariable String id,
            @RequestBody ImsSectionsDto dto) {
        return ResponseEntity.ok(
                ApiResponse.<ImsSectionsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Section updated successfully")
                        .apiData(service.update(id, dto))
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsSectionsDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsSectionsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Section fetched successfully")
                        .apiData(service.getById(id))
                        .build());
    }

    @GetMapping("/class/{classId}")
    public ResponseEntity<ApiResponse<List<ImsSectionsDto>>> getByClass(@PathVariable String classId) {
        return ResponseEntity.ok(
                ApiResponse.<List<ImsSectionsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Sections fetched successfully")
                        .apiData(service.getByClass(classId))
                        .build());
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<ImsSectionsDto>>> getByTenant(@PathVariable String tenantId) {
        return ResponseEntity.ok(
                ApiResponse.<List<ImsSectionsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Sections fetched successfully")
                        .apiData(service.getByTenant(tenantId))
                        .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {

        service.delete(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Section deleted successfully")
                        .apiData(null)
                        .build());
    }
}
