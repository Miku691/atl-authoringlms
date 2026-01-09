package com.ims.academic.controller;

import com.ims.academic.dto.AcademicReadinessDto;
import com.ims.academic.service.AcademicReadinessService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/readiness")
@RequiredArgsConstructor
public class AcademicReadinessController {

    private final AcademicReadinessService readinessService;

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<AcademicReadinessDto>> getReadinessStatus(
            @RequestHeader("X-Tenant-Id") String tenantId) {
        AcademicReadinessDto status = readinessService.checkReadiness(tenantId);
        return ResponseEntity.ok(
                ApiResponse.<AcademicReadinessDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Readiness status fetched successfully")
                        .apiData(status)
                        .build());
    }
}
