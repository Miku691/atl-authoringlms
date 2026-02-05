package com.ims.finance.controller;

import com.ims.finance.dto.FeeDiscountDTO;
import com.ims.finance.service.FeeDiscountService;
import com.ims.finance.util.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Controller for managing Fee Discounts.
 */
@RestController
@RequestMapping("/api/v1/finance/fee-discounts")
public class FeeDiscountController {

    private final FeeDiscountService feeDiscountService;

    public FeeDiscountController(FeeDiscountService feeDiscountService) {
        this.feeDiscountService = feeDiscountService;
    }

    /**
     * Creates a new fee discount.
     *
     * @param feeDiscountDTO discount details
     * @return created discount
     */
    @PostMapping
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<FeeDiscountDTO>> createFeeDiscount(
            @Valid @RequestBody FeeDiscountDTO feeDiscountDTO) {
        FeeDiscountDTO created = feeDiscountService.createFeeDiscount(feeDiscountDTO);
        return new ResponseEntity<>(
                ApiResponse.success(HttpStatus.CREATED.value(), "Fee discount created successfully", created),
                HttpStatus.CREATED);
    }

    /**
     * Retrieves all fee discounts for the current tenant.
     *
     * @return list of fee discounts
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<FeeDiscountDTO>>> getAllFeeDiscounts() {
        List<FeeDiscountDTO> discounts = feeDiscountService.getAllFeeDiscounts();
        return ResponseEntity.ok(ApiResponse.success("Fee discounts fetched successfully", discounts));
    }

    /**
     * Retrieves a fee discount by its ID.
     *
     * @param id discount ID
     * @return discount details
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<FeeDiscountDTO>> getFeeDiscountById(@PathVariable String id) {
        FeeDiscountDTO discount = feeDiscountService.getFeeDiscountById(id);
        return ResponseEntity.ok(ApiResponse.success("Fee discount fetched successfully", discount));
    }

    /**
     * Updates an existing fee discount.
     *
     * @param id             discount ID
     * @param feeDiscountDTO updated details
     * @return updated discount
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<FeeDiscountDTO>> updateFeeDiscount(@PathVariable String id,
            @Valid @RequestBody FeeDiscountDTO feeDiscountDTO) {
        FeeDiscountDTO updated = feeDiscountService.updateFeeDiscount(id, feeDiscountDTO);
        return ResponseEntity.ok(ApiResponse.success("Fee discount updated successfully", updated));
    }

    /**
     * Deletes a fee discount by its ID.
     *
     * @param id discount ID
     * @return success response
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteFeeDiscount(@PathVariable String id) {
        feeDiscountService.deleteFeeDiscount(id);
        return ResponseEntity.ok(ApiResponse.success("Fee discount deleted successfully", null));
    }
}
