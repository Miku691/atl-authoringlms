package com.ims.finance.controller;

import com.ims.finance.dto.LateFeeRuleDTO;
import com.ims.finance.service.LateFeeRuleService;
import com.ims.finance.util.ApiResponse;
import com.ims.finance.util.ApplicationConstant;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Controller for managing late fee penalty rules.
 */
@RestController
@RequestMapping("/api/v1/finance/late-fee-rules")
public class LateFeeRuleController {

    private final LateFeeRuleService lateFeeRuleService;

    public LateFeeRuleController(LateFeeRuleService lateFeeRuleService) {
        this.lateFeeRuleService = lateFeeRuleService;
    }

    @PostMapping
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<LateFeeRuleDTO>> createRule(@Valid @RequestBody LateFeeRuleDTO ruleDTO) {
        LateFeeRuleDTO created = lateFeeRuleService.createLateFeeRule(ruleDTO);
        return new ResponseEntity<>(
                ApiResponse.success(HttpStatus.CREATED.value(), "Late fee rule created", created),
                HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<LateFeeRuleDTO>>> getAllRules() {
        List<LateFeeRuleDTO> rules = lateFeeRuleService.getAllLateFeeRules();
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Late fee rules fetched", rules));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRule(@PathVariable String id) {
        lateFeeRuleService.deleteLateFeeRule(id);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Late fee rule deleted", null));
    }
}
