package com.ims.platform.controller;

import com.ims.platform.dto.ImsSubscriptionPlansDto;
import com.ims.platform.service.SubscriptionPlansService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/platform")
@RequiredArgsConstructor
public class SubscriptionPlansController {

    private final SubscriptionPlansService service;

    /**
     * Public API to fetch active subscription plans for the landing page.
     */
    @GetMapping("/public/plans")
    public ResponseEntity<List<ImsSubscriptionPlansDto>> getPublicPlans() {
        return ResponseEntity.ok(service.getAllPlans(true));
    }

    /**
     * Admin API to fetch all plans (including inactive ones).
     */
    @GetMapping("/admin/plans")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<ImsSubscriptionPlansDto>> getAllPlans() {
        return ResponseEntity.ok(service.getAllPlans(false));
    }

    /**
     * Admin API to create a new plan.
     */
    @PostMapping("/admin/plans")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ImsSubscriptionPlansDto> createPlan(@RequestBody ImsSubscriptionPlansDto dto) {
        return ResponseEntity.ok(service.createPlan(dto));
    }

    /**
     * Admin API to update an existing plan.
     */
    @PutMapping("/admin/plans/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<ImsSubscriptionPlansDto> updatePlan(@PathVariable String id, @RequestBody ImsSubscriptionPlansDto dto) {
        return ResponseEntity.ok(service.updatePlan(id, dto));
    }

    /**
     * API to fetch plan details by ID.
     */
    @GetMapping("/plans/{id}")
    public ResponseEntity<ImsSubscriptionPlansDto> getPlanById(@PathVariable String id) {
        return ResponseEntity.ok(service.getPlanById(id));
    }

    /**
     * Seeds the system with default Starter, Professional, and Enterprise plans.
     * Only adds plans that do not already exist.
     */
    @PostMapping("/admin/plans/seed")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> seedDefaultPlans() {
        service.seedDefaultPlans();
        return ResponseEntity.ok("Default plans seeded successfully");
    }
}
