package com.ims.finance.controller;

import com.ims.finance.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for one-click bulk setup of finance data.
 */
@RestController
@RequestMapping("/api/v1/finance/bulk-setup")
@RequiredArgsConstructor
public class FinanceBulkSetupController {

    private final FinanceService financeService;

    @PostMapping("/fee-heads")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<Void> setupFeeHeads() {
        financeService.bootstrapFeeHeads();
        return ResponseEntity.ok().build();
    }

    @PostMapping("/expense-categories")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<Void> setupExpenseCategories() {
        financeService.bootstrapExpenseCategories();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<Map<String, Boolean>> getStatus() {
        return ResponseEntity.ok(financeService.getBulkSetupStatus());
    }
}
