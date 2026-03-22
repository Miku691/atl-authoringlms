package com.ims.finance.controller;

import com.ims.finance.dto.ExpenseCategoryDTO;
import com.ims.finance.dto.ExpenseDTO;
import com.ims.finance.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/finance/expenses")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    // Categories
    @PostMapping("/categories")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<Map<String, Object>> createCategory(@RequestBody ExpenseCategoryDTO dto) {
        return ResponseEntity.ok(Map.of("apiData", expenseService.createCategory(dto)));
    }

    @GetMapping("/categories")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<Map<String, Object>> getCategories() {
        return ResponseEntity.ok(Map.of("apiData", expenseService.getCategoriesByTenant()));
    }

    @DeleteMapping("/categories/{id}")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable String id) {
        expenseService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    // Expenses
    @PostMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<Map<String, Object>> recordExpense(@RequestBody ExpenseDTO dto) {
        return ResponseEntity.ok(Map.of("apiData", expenseService.recordExpense(dto)));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<Map<String, Object>> getExpenses() {
        return ResponseEntity.ok(Map.of("apiData", expenseService.getExpensesByTenant()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<Void> deleteExpense(@PathVariable String id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
