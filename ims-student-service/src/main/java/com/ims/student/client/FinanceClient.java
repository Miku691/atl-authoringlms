package com.ims.student.client;

import com.ims.student.util.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@FeignClient(name = "ims-finance-service")
public interface FinanceClient {

    /**
     * Internal endpoint to trigger fee allocation and arrears carry-forward during promotion.
     * 
     * @param request Map containing studentId, targetOfferingId, targetAcademicYear, sourceAcademicYear
     */
    @PostMapping("/finance/internal/allocate-and-carry-forward")
    ApiResponse<Void> triggerPromotionFinance(@RequestBody Map<String, String> request);

    @PostMapping("/finance/internal/bulk-allocate-and-carry-forward")
    ApiResponse<Void> bulkTriggerPromotionFinance(@RequestBody java.util.List<Map<String, String>> requests);
}
