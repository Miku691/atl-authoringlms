package com.ims.finance.service;

import java.util.List;
import java.util.Map;

public interface FiscalClosingService {

    /**
     * Orchestrates the financial transition for a student during promotion.
     * Handles arrears carry-forward and new fee allocation.
     * 
     * @param request Map containing studentId, targetOfferingId,
     *                targetAcademicYear, sourceAcademicYear, tenantId
     */
    void allocateAndCarryForward(Map<String, String> request, String tenantId);

    void bulkAllocateAndCarryForward(List<Map<String, String>> requests, String tenantId);
}
