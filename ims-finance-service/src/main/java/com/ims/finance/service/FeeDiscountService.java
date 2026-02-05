package com.ims.finance.service;

import com.ims.finance.dto.FeeDiscountDTO;
import java.util.List;

public interface FeeDiscountService {
    /**
     * Creates a new fee discount.
     *
     * @param feeDiscountDTO discount details
     * @return created discount
     */
    FeeDiscountDTO createFeeDiscount(FeeDiscountDTO feeDiscountDTO);

    /**
     * Retrieves all fee discounts for the current tenant.
     *
     * @return list of fee discounts
     */
    List<FeeDiscountDTO> getAllFeeDiscounts();

    /**
     * Retrieves a fee discount by its ID.
     *
     * @param id discount ID
     * @return discount details
     */
    FeeDiscountDTO getFeeDiscountById(String id);

    /**
     * Updates an existing fee discount.
     *
     * @param id             discount ID
     * @param feeDiscountDTO updated details
     * @return updated discount
     */
    FeeDiscountDTO updateFeeDiscount(String id, FeeDiscountDTO feeDiscountDTO);

    /**
     * Deletes a fee discount by its ID.
     *
     * @param id discount ID
     */
    void deleteFeeDiscount(String id);
}
