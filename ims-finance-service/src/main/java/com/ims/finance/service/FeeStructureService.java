package com.ims.finance.service;

import com.ims.finance.dto.FeeStructureDTO;
import java.util.List;

public interface FeeStructureService {
    /**
     * Creates a new fee structure.
     *
     * @param feeStructureDTO fee structure details
     * @return created fee structure
     */
    FeeStructureDTO createFeeStructure(FeeStructureDTO feeStructureDTO);

    /**
     * Retrieves all fee structures for the current tenant.
     *
     * @return list of fee structures
     */
    List<FeeStructureDTO> getAllFeeStructures();

    /**
     * Retrieves fee structures for a specific offering.
     *
     * @param offeringId offering ID
     * @return list of fee structures
     */
    List<FeeStructureDTO> getFeeStructuresByOffering(String offeringId);

    /**
     * Retrieves a fee structure by its ID.
     *
     * @param id fee structure ID
     * @return fee structure details
     */
    FeeStructureDTO getFeeStructureById(String id);

    /**
     * Updates an existing fee structure.
     *
     * @param id              fee structure ID
     * @param feeStructureDTO updated details
     * @return updated fee structure
     */
    FeeStructureDTO updateFeeStructure(String id, FeeStructureDTO feeStructureDTO);

    /**
     * Deletes a fee structure by its ID.
     *
     * @param id fee structure ID
     */
    void deleteFeeStructure(String id);
}
