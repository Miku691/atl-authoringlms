package com.ims.academic.controller;

import com.ims.academic.dto.ImsBranchesDto;
import com.ims.academic.service.ImsBranchesService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("branches")
@RequiredArgsConstructor
public class ImsBranchesController {

    private final ImsBranchesService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsBranchesDto>> create(@RequestBody ImsBranchesDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.<ImsBranchesDto>builder()
                .status("SUCCESS")
                .statusCode(HttpStatus.CREATED.value())
                .message("Branch created successfully")
                .apiData(service.create(dto))
                .build());
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<ImsBranchesDto>>> getByTenant(@PathVariable String tenantId) {
        return ResponseEntity.ok(
            ApiResponse.<List<ImsBranchesDto>>builder()
                .status("SUCCESS")
                .statusCode(HttpStatus.OK.value())
                .message("Branches fetched successfully")
                .apiData(service.getByTenantId(tenantId))
                .build());
    }

    @GetMapping("/tenant/{tenantId}/program/{programId}")
    public ResponseEntity<ApiResponse<List<ImsBranchesDto>>> getByProgram(@PathVariable String tenantId, @PathVariable String programId) {
        return ResponseEntity.ok(
            ApiResponse.<List<ImsBranchesDto>>builder()
                .status("SUCCESS")
                .statusCode(HttpStatus.OK.value())
                .message("Branches fetched successfully")
                .apiData(service.getByProgramId(tenantId, programId))
                .build());
    }
}
