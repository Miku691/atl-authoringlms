package com.ims.finance.controller;

import com.ims.finance.dto.CollectPaymentDTO;
import com.ims.finance.dto.CollectionSummaryDTO;
import com.ims.finance.dto.RefundDTO;
import com.ims.finance.dto.TransactionDTO;
import com.ims.finance.service.FinanceService;
import com.ims.finance.service.ReceiptService;
import com.ims.finance.util.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * Controller for general finance operations like payment collection.
 */
@RestController
@RequestMapping("/api/v1/finance")
public class FinanceController {

    private final FinanceService financeService;
    private final ReceiptService receiptService;

    public FinanceController(FinanceService financeService, ReceiptService receiptService) {
        this.financeService = financeService;
        this.receiptService = receiptService;
    }

    /**
     * Retrieves a collection summary for the dashboard.
     *
     * @return collection summary
     */
    @GetMapping("/stats/collection-summary")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<CollectionSummaryDTO>> getCollectionSummary() {
        return ResponseEntity.ok(ApiResponse.success("Collection summary fetched successfully",
                financeService.getCollectionSummary()));
    }

    /**
     * Retrieves a list of defaulters (students with overdue fees).
     *
     * @param offeringId optional filter by offering ID
     * @return list of defaulter summaries
     */
    @GetMapping("/stats/defaulters")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<com.ims.finance.dto.DefaulterDTO>>> getDefaulters(
            @RequestParam(required = false) String offeringId) {
        return ResponseEntity.ok(ApiResponse.success("Defaulters fetched successfully",
                financeService.getDefaulters(offeringId)));
    }

    /**
     * Collects a payment from a student.
     *
     * @param collectPaymentDTO payment details
     * @return transaction record
     */
    @PostMapping("/collect")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<TransactionDTO>> collectPayment(
            @Valid @RequestBody CollectPaymentDTO collectPaymentDTO) {
        TransactionDTO transaction = financeService.collectPayment(collectPaymentDTO);
        return new ResponseEntity<>(
                ApiResponse.success(HttpStatus.CREATED.value(), "Payment collected successfully", transaction),
                HttpStatus.CREATED);
    }

    /**
     * Retrieves all transactions for a specific student.
     *
     * @param studentId student ID
     * @return list of transactions
     */
    @GetMapping("/transactions/{studentId}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT', 'STUDENT', 'GUARDIAN', 'PARENT')")
    public ResponseEntity<ApiResponse<List<TransactionDTO>>> getStudentTransactions(@PathVariable String studentId) {
        List<TransactionDTO> transactions = financeService.getStudentTransactions(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student transactions fetched successfully", transactions));
    }

    /**
     * Retrieves own transactions for the logged-in student.
     *
     * @return list of transactions
     */
    @GetMapping("/transactions/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<TransactionDTO>>> getMyTransactions() {
        List<TransactionDTO> transactions = financeService.getMyTransactions();
        return ResponseEntity.ok(ApiResponse.success("Your transactions fetched successfully", transactions));
    }

    /**
     * Retrieves transactions for all wards of the logged-in guardian.
     *
     * @return map of ward IDs to transactions
     */
    @GetMapping("/transactions/wards")
    @PreAuthorize("hasAnyRole('GUARDIAN', 'PARENT')")
    public ResponseEntity<ApiResponse<java.util.Map<String, List<TransactionDTO>>>> getWardsTransactions() {
        java.util.Map<String, List<TransactionDTO>> transactions = financeService.getWardsTransactions();
        return ResponseEntity.ok(ApiResponse.success("Wards' transactions fetched successfully", transactions));
    }

    /**
     * Downloads a PDF receipt for a specific transaction.
     *
     * @param transactionId transaction ID
     * @return PDF file
     */
    @GetMapping("/transactions/{transactionId}/receipt")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT', 'STUDENT', 'GUARDIAN', 'PARENT')")
    public ResponseEntity<byte[]> downloadReceipt(@PathVariable String transactionId) {
        TransactionDTO transaction = financeService.getTransactionById(transactionId);

        byte[] pdf = receiptService.generateReceipt(transaction);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "receipt_" + transactionId + ".pdf");

        return new ResponseEntity<>(pdf, headers, HttpStatus.OK);
    }

    /**
     * Processes a refund for a student fee record.
     *
     * @param refundDTO refund details
     * @return processed refund
     */
    @PostMapping("/refund")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<ApiResponse<RefundDTO>> processRefund(@Valid @RequestBody RefundDTO refundDTO) {
        RefundDTO processed = financeService.processRefund(refundDTO);
        return new ResponseEntity<>(
                ApiResponse.success(HttpStatus.OK.value(), "Refund processed successfully", processed),
                HttpStatus.OK);
    }

    /**
     * Retrieves all transactions for a specific day.
     */
    @GetMapping("/reports/day-book")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<TransactionDTO>>> getDayBook(
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate date) {
        return ResponseEntity.ok(ApiResponse.success("Day book fetched successfully",
                financeService.getDayBook(date)));
    }

    /**
     * Retrieves students with outstanding fees.
     */
    @GetMapping("/reports/outstanding")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<List<com.ims.finance.dto.OutstandingFeeDTO>>> getOutstandingFees() {
        return ResponseEntity.ok(ApiResponse.success("Outstanding fees report fetched successfully",
                financeService.getOutstandingFees()));
    }

    /**
     * Retrieves an income vs expense report.
     */
    @GetMapping("/reports/income-expense")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ACCOUNTANT')")
    public ResponseEntity<ApiResponse<com.ims.finance.dto.IncomeExpenseReportDTO>> getIncomeExpenseReport(
            @RequestParam String academicYear) {
        return ResponseEntity.ok(ApiResponse.success("Income-Expense report fetched successfully",
                financeService.getIncomeExpenseReport(academicYear)));
    }
}
