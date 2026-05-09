package com.ims.academic.controller;

import com.ims.academic.dto.ImsCoursesDto;
import com.ims.academic.service.ImsCoursesService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("courses")
@RequiredArgsConstructor
public class ImsCoursesController {

    private final ImsCoursesService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsCoursesDto>> create(@RequestBody ImsCoursesDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.<ImsCoursesDto>builder()
                .status("SUCCESS")
                .statusCode(HttpStatus.CREATED.value())
                .message("Course created successfully")
                .apiData(service.create(dto))
                .build());
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<ImsCoursesDto>>> getByTenant(@PathVariable String tenantId) {
        return ResponseEntity.ok(
            ApiResponse.<List<ImsCoursesDto>>builder()
                .status("SUCCESS")
                .statusCode(HttpStatus.OK.value())
                .message("Courses fetched successfully")
                .apiData(service.getByTenantId(tenantId))
                .build());
    }

    @GetMapping("/tenant/{tenantId}/program/{programId}")
    public ResponseEntity<ApiResponse<List<ImsCoursesDto>>> getByProgram(@PathVariable String tenantId, @PathVariable String programId) {
        return ResponseEntity.ok(
            ApiResponse.<List<ImsCoursesDto>>builder()
                .status("SUCCESS")
                .statusCode(HttpStatus.OK.value())
                .message("Courses fetched successfully")
                .apiData(service.getByProgramId(tenantId, programId))
                .build());
    }
}
