package com.ims.finance.controller;

import com.ims.finance.dto.FeeStructureDTO;
import com.ims.finance.service.FeeStructureService;
import com.ims.finance.util.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Controller for managing Fee Structures.
 */
@RestController
@RequestMapping("/api/v1/finance/fee-structures")
public class FeeStructureController {

    private final FeeStructureService feeStructureService;

    public FeeStructureController(FeeStructureService feeStructureService) {
        this.feeStructureService = feeStructureService;
    }

    /**
     * Creates a new fee structure.
     *
     * @param feeStructureDTO fee structure details
     * @return created fee structure
     */
    @PostMapping
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<FeeStructureDTO>> createFeeStructure(
            @Valid @RequestBody FeeStructureDTO feeStructureDTO) {
        FeeStructureDTO created = feeStructureService.createFeeStructure(feeStructureDTO);
        return new ResponseEntity<>(
                ApiResponse.success(HttpStatus.CREATED.value(), "Fee structure created successfully", created),
                HttpStatus.CREATED);
    }

    /**
     * Retrieves all fee structures for the current tenant.
     *
     * @return list of fee structures
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<FeeStructureDTO>>> getAllFeeStructures() {
        List<FeeStructureDTO> structures = feeStructureService.getAllFeeStructures();
        return ResponseEntity.ok(ApiResponse.success("Fee structures fetched successfully", structures));
    }

    /**
     * Retrieves fee structures for a specific offering.
     *
     * @param offeringId offering ID
     * @return list of fee structures
     */
    @GetMapping("/offering/{offeringId}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<FeeStructureDTO>>> getFeeStructuresByOffering(
            @PathVariable String offeringId) {
        List<FeeStructureDTO> structures = feeStructureService.getFeeStructuresByOffering(offeringId);
        return ResponseEntity
                .ok(ApiResponse.success("Fee structures for offering fetched successfully", structures));
    }

    /**
     * Retrieves a fee structure by its ID.
     *
     * @param id fee structure ID
     * @return fee structure details
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<FeeStructureDTO>> getFeeStructureById(@PathVariable String id) {
        FeeStructureDTO structure = feeStructureService.getFeeStructureById(id);
        return ResponseEntity.ok(ApiResponse.success("Fee structure fetched successfully", structure));
    }

    /**
     * Updates an existing fee structure.
     *
     * @param id              fee structure ID
     * @param feeStructureDTO updated details
     * @return updated fee structure
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<FeeStructureDTO>> updateFeeStructure(@PathVariable String id,
            @Valid @RequestBody FeeStructureDTO feeStructureDTO) {
        FeeStructureDTO updated = feeStructureService.updateFeeStructure(id, feeStructureDTO);
        return ResponseEntity.ok(ApiResponse.success("Fee structure updated successfully", updated));
    }

    /**
     * Deletes a fee structure by its ID.
     *
     * @param id fee structure ID
     * @return success response
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFeeStructure(@PathVariable String id) {
        feeStructureService.deleteFeeStructure(id);
        return ResponseEntity.ok(ApiResponse.success("Fee structure deleted successfully", null));
    }
}
