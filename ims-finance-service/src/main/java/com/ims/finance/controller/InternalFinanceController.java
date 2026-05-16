package com.ims.finance.controller;

import com.ims.finance.service.FiscalClosingService;
import com.ims.finance.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/finance/internal")
@RequiredArgsConstructor
public class InternalFinanceController {

    private final FiscalClosingService fiscalClosingService;

    /**
     * Internal endpoint for Student Service to trigger financial transition during promotion.
     */
    @PostMapping("/allocate-and-carry-forward")
    public ResponseEntity<ApiResponse<Void>> allocateAndCarryForward(
            @RequestBody Map<String, String> request,
            @RequestHeader(name = "X-Tenant-Id") String tenantId) {
        
        fiscalClosingService.allocateAndCarryForward(request, tenantId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Finance transition processed", null));
    }

    @PostMapping("/bulk-allocate-and-carry-forward")
    public ResponseEntity<ApiResponse<Void>> bulkAllocateAndCarryForward(
            @RequestBody java.util.List<Map<String, String>> requests,
            @RequestHeader(name = "X-Tenant-Id") String tenantId) {
        
        fiscalClosingService.bulkAllocateAndCarryForward(requests, tenantId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Bulk finance transitions processed", null));
    }
}
