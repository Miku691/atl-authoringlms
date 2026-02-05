package com.ims.finance.service;

import com.ims.finance.dto.FeeHeadDTO;
import java.util.List;

public interface FeeHeadService {
    /**
     * Creates a new fee head.
     *
     * @param feeHeadDTO fee head details
     * @return created fee head
     */
    FeeHeadDTO createFeeHead(FeeHeadDTO feeHeadDTO);

    /**
     * Retrieves all fee heads for the current tenant.
     *
     * @return list of fee heads
     */
    List<FeeHeadDTO> getAllFeeHeads();

    /**
     * Retrieves a fee head by its ID.
     *
     * @param id fee head ID
     * @return fee head details
     */
    FeeHeadDTO getFeeHeadById(String id);

    /**
     * Updates an existing fee head.
     *
     * @param id         fee head ID
     * @param feeHeadDTO updated details
     * @return updated fee head
     */
    FeeHeadDTO updateFeeHead(String id, FeeHeadDTO feeHeadDTO);

    /**
     * Deletes a fee head by its ID.
     *
     * @param id fee head ID
     */
    void deleteFeeHead(String id);
}
