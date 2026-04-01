package com.ims.finance.service.impl;

import com.ims.finance.client.NotificationWebClient;
import com.ims.finance.client.ReportsWebClient;
import com.ims.finance.client.StudentServiceClient;
import com.ims.finance.dto.ExternalEmailRequestDTO;
import com.ims.finance.repository.TransactionRepository;
import com.ims.finance.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Service to handle background invoice generation and notification using WebClient.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class InvoiceAsyncService {

    private final ReportsWebClient reportsWebClient;
    private final NotificationWebClient notificationWebClient;
    private final StudentServiceClient studentServiceClient;
    private final TransactionRepository transactionRepository;

    /**
     * Non-blocking flow to generate and send an invoice.
     * Uses WebClient with internal retries for resilience.
     */
    public void generateAndSendInvoice(String receiptNo, String studentId, String tenantId, String userId, String roles) {
        log.info("[WEBCLIENT-FLOW] Initiating invoice flow for Receipt: {}", receiptNo);

        // 1. Fetch Student Details (Keep this synchronous for now as we need email to proceed)
        final String email;
        final String fullName;
        try {
            ApiResponse<StudentServiceClient.StudentResponse> studentRes = studentServiceClient.getStudentById(studentId);
            if (studentRes == null || studentRes.getApiData() == null || studentRes.getApiData().getEmail() == null) {
                log.error("[WEBCLIENT-FLOW] Could not proceed: Student/Email not found for ID: {}", studentId);
                return;
            }
            email = studentRes.getApiData().getEmail();
            fullName = studentRes.getApiData().getFirstName() + " " + studentRes.getApiData().getLastName();
        } catch (Exception e) {
            log.error("[WEBCLIENT-FLOW] Error fetching student details: {}", e.getMessage());
            return;
        }

        // 2. Chained Reactive Flow: Generate Invoice -> Send Email
        reportsWebClient.generateInvoice(receiptNo, tenantId, userId, roles)
                .switchIfEmpty(Mono.error(new RuntimeException("Reports service returned empty (possibly retries exhausted)")))
                .flatMap(pdfPath -> {
                    if (pdfPath == null || pdfPath.isEmpty()) {
                        return Mono.error(new RuntimeException("Received empty PDF path from Reports service"));
                    }

                    Map<String, Object> templateData = new HashMap<>();
                    templateData.put("studentName", fullName);
                    templateData.put("receiptNo", receiptNo);

                    // Calculate actual total amount
                    BigDecimal totalAmount = BigDecimal.ZERO;
                    try {
                        var transactions = transactionRepository.findByReceiptNoAndTenantId(receiptNo, tenantId);
                        totalAmount = transactions.stream()
                                .map(t -> t.getAmount())
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                    } catch (Exception e) {
                        log.warn("[WEBCLIENT-FLOW] Could not calculate real total Sum from Repo, using 0: {}", e.getMessage());
                    }
                    
                    templateData.put("amount", "₹ " + totalAmount.toString());
                    templateData.put("paymentDate", java.time.LocalDate.now().toString());
                    templateData.put("institutionName", "IMS Portal");

                    ExternalEmailRequestDTO emailRequest = ExternalEmailRequestDTO.builder()
                            .to(email)
                            .subject("Fee Payment Receipt - " + receiptNo)
                            .templateName("fee-receipt")
                            .templateData(templateData)
                            .isHtml(true)
                            .attachmentPath(pdfPath)
                            .build();

                    return notificationWebClient.sendEmail(emailRequest, userId, roles, tenantId)
                            .then(Mono.just(true)); // Signal completion for logging
                })
                .doOnSuccess(success -> {
                    if (success != null && success) {
                        log.info("[WEBCLIENT-FLOW] Completed successfully for Receipt: {}", receiptNo);
                    }
                })
                .doOnError(e -> log.error("[WEBCLIENT-FLOW] Flow failed for Receipt: {} Error: {}", receiptNo, e.getMessage()))
                .subscribe(); // Trigger the reactive pipeline non-blockingly
    }
}
