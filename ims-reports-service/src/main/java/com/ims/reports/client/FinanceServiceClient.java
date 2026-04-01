package com.ims.reports.client;

import com.ims.reports.util.ApiResponse;
import lombok.Data;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.ims.reports.util.SecurityConstant;
import org.springframework.web.bind.annotation.RequestHeader;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@FeignClient(name = "ims-finance-service")
public interface FinanceServiceClient {

    @GetMapping("/api/v1/finance/transactions/receipt")
    ApiResponse<List<TransactionResponse>> getTransactionsByReceipt(
            @RequestParam("receiptNo") String receiptNo,
            @RequestParam("tenantId") String tenantId,
            @RequestHeader(SecurityConstant.USER_ID_HEADER) String userId,
            @RequestHeader(SecurityConstant.ROLES_HEADER) String roles);

    @Data
    class TransactionResponse {
        private String id;
        private String studentId;
        private BigDecimal amount;
        private String academicYear;
        private String paymentMode;
        private String referenceNumber;
        private LocalDateTime transactionDate;
        private String studentName;
        private String offeringName;
        private String tenantId;
        private String collectedBy;
        private String receiptNo;
        private String feeHeadId;
        private String feeHeadName;
    }
}
