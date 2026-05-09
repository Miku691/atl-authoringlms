package com.ims.academic.controller;

import com.ims.academic.dto.ImsYearsDto;
import com.ims.academic.service.ImsYearsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("years")
@RequiredArgsConstructor
public class ImsYearsController {

    private final ImsYearsService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsYearsDto>> create(@RequestBody ImsYearsDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.<ImsYearsDto>builder()
                .status("SUCCESS")
                .statusCode(HttpStatus.CREATED.value())
                .message("Year created successfully")
                .apiData(service.create(dto))
                .build());
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<ImsYearsDto>>> getByTenant(@PathVariable String tenantId) {
        return ResponseEntity.ok(
            ApiResponse.<List<ImsYearsDto>>builder()
                .status("SUCCESS")
                .statusCode(HttpStatus.OK.value())
                .message("Years fetched successfully")
                .apiData(service.getByTenantId(tenantId))
                .build());
    }

    @GetMapping("/tenant/{tenantId}/branch/{branchId}")
    public ResponseEntity<ApiResponse<List<ImsYearsDto>>> getByBranch(@PathVariable String tenantId, @PathVariable String branchId) {
        return ResponseEntity.ok(
            ApiResponse.<List<ImsYearsDto>>builder()
                .status("SUCCESS")
                .statusCode(HttpStatus.OK.value())
                .message("Years fetched successfully")
                .apiData(service.getByBranchId(tenantId, branchId))
                .build());
    }
}
