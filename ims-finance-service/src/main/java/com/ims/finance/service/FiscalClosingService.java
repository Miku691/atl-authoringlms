package com.ims.finance.service;

import java.util.Map;

public interface FiscalClosingService {

    /**
     * Orchestrates the financial transition for a student during promotion.
     * Handles arrears carry-forward and new fee allocation.
     * 
     * @param request Map containing studentId, targetOfferingId, targetAcademicYear, sourceAcademicYear, tenantId
     */
    void allocateAndCarryForward(Map<String, String> request, String tenantId);
}
