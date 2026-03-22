package com.ims.finance.controller;

import com.ims.finance.dto.BudgetDTO;
import com.ims.finance.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/finance/budgets")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @PostMapping
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<Map<String, Object>> saveBudget(@RequestBody BudgetDTO dto) {
        return ResponseEntity.ok(Map.of("apiData", budgetService.saveBudget(dto)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<Map<String, Object>> getBudgets(@RequestParam String academicYear) {
        return ResponseEntity.ok(Map.of("apiData", budgetService.getBudgets(academicYear)));
    }

    @GetMapping("/report")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<Map<String, Object>> getBudgetVsActual(@RequestParam String academicYear) {
        return ResponseEntity.ok(Map.of("apiData", budgetService.getBudgetVsActual(academicYear)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<Void> deleteBudget(@PathVariable String id) {
        budgetService.deleteBudget(id);
        return ResponseEntity.noContent().build();
    }
}
