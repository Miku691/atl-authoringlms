package com.ims.academic.controller;

import com.ims.academic.service.ImsBootstrapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for one-click bulk setup of academic data.
 */
@RestController
@RequestMapping("/api/v1/academic/bulk-setup")
@RequiredArgsConstructor
public class AcademicBulkSetupController {

    private final ImsBootstrapService bootstrapService;

    @PostMapping("/subjects")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<Void> setupSubjects(@RequestParam String tenantId) {
        bootstrapService.bootstrapSubjects(tenantId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/grading")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<Void> setupGrading(@RequestParam String tenantId) {
        bootstrapService.bootstrapGradingScales(tenantId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/departments")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<Void> setupDepartments(@RequestParam String tenantId) {
        bootstrapService.bootstrapDepartments(tenantId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<Map<String, Boolean>> getStatus(@RequestParam String tenantId) {
        return ResponseEntity.ok(bootstrapService.getBulkSetupStatus(tenantId));
    }
}
