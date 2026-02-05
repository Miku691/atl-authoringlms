package com.ims.finance.controller;

import com.ims.finance.dto.FeeHeadDTO;
import com.ims.finance.service.FeeHeadService;
import com.ims.finance.util.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Controller for managing Fee Heads.
 */
@RestController
@RequestMapping("/api/v1/finance/fee-heads")
public class FeeHeadController {

    private final FeeHeadService feeHeadService;

    public FeeHeadController(FeeHeadService feeHeadService) {
        this.feeHeadService = feeHeadService;
    }

    /**
     * Creates a new fee head.
     *
     * @param feeHeadDTO fee head details
     * @return created fee head
     */
    @PostMapping
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<FeeHeadDTO>> createFeeHead(@Valid @RequestBody FeeHeadDTO feeHeadDTO) {
        FeeHeadDTO created = feeHeadService.createFeeHead(feeHeadDTO);
        return new ResponseEntity<>(
                ApiResponse.success(HttpStatus.CREATED.value(), "Fee head created successfully", created),
                HttpStatus.CREATED);
    }

    /**
     * Retrieves all fee heads for the current tenant.
     *
     * @return list of fee heads
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<FeeHeadDTO>>> getAllFeeHeads() {
        List<FeeHeadDTO> feeHeads = feeHeadService.getAllFeeHeads();
        return ResponseEntity.ok(ApiResponse.success("Fee heads fetched successfully", feeHeads));
    }

    /**
     * Retrieves a fee head by its ID.
     *
     * @param id fee head ID
     * @return fee head details
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<FeeHeadDTO>> getFeeHeadById(@PathVariable String id) {
        FeeHeadDTO feeHead = feeHeadService.getFeeHeadById(id);
        return ResponseEntity.ok(ApiResponse.success("Fee head fetched successfully", feeHead));
    }

    /**
     * Updates an existing fee head.
     *
     * @param id         fee head ID
     * @param feeHeadDTO updated details
     * @return updated fee head
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<FeeHeadDTO>> updateFeeHead(@PathVariable String id,
            @Valid @RequestBody FeeHeadDTO feeHeadDTO) {
        FeeHeadDTO updated = feeHeadService.updateFeeHead(id, feeHeadDTO);
        return ResponseEntity.ok(ApiResponse.success("Fee head updated successfully", updated));
    }

    /**
     * Deletes a fee head by its ID.
     *
     * @param id fee head ID
     * @return success response
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFeeHead(@PathVariable String id) {
        feeHeadService.deleteFeeHead(id);
        return ResponseEntity.ok(ApiResponse.success("Fee head deleted successfully", null));
    }
}
