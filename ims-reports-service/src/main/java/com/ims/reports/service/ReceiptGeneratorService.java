package com.ims.reports.service;

import com.ims.reports.client.FinanceServiceClient;
import com.ims.reports.util.ApiResponse;
import com.ims.reports.util.NumberToWords;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.JasperCompileManager;
import net.sf.jasperreports.engine.JasperExportManager;
import net.sf.jasperreports.engine.JasperFillManager;
import net.sf.jasperreports.engine.JasperPrint;
import net.sf.jasperreports.engine.JasperReport;
import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Generates professional fee receipt PDFs using JasperReports.
 * Fetches transaction data and tenant branding to produce a clean receipt.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ReceiptGeneratorService {

    private final FinanceServiceClient financeServiceClient;
    private final TemplateService templateService;

    @Value("${ims.reports.storage-path:D:/ATL/uploads/receipts/}")
    private String storagePath;

    /**
     * Generates a fee receipt PDF for the given receipt number.
     *
     * @param receiptNo the receipt number
     * @param tenantId  the tenant identifier
     * @param userId    the requesting user ID
     * @param roles     the user roles
     * @return the file path of the generated PDF
     */
    public String generateReceiptPdf(String receiptNo, String tenantId, String userId, String roles) {
        log.info("Generating receipt PDF for Receipt: {} (Tenant: {})", receiptNo, tenantId);

        try {
            // 1. Fetch Transaction Data
            ApiResponse<List<FinanceServiceClient.TransactionResponse>> txRes = financeServiceClient
                    .getTransactionsByReceipt(receiptNo, tenantId, userId, roles);
            if (txRes == null || txRes.getApiData() == null || txRes.getApiData().isEmpty()) {
                throw new RuntimeException("No transaction data found for receipt: " + receiptNo);
            }
            List<FinanceServiceClient.TransactionResponse> transactions = txRes.getApiData();
            FinanceServiceClient.TransactionResponse firstTx = transactions.get(0);

            // 2. Calculate total amount
            BigDecimal totalAmount = transactions.stream()
                    .map(FinanceServiceClient.TransactionResponse::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // 3. Build parameters from tenant branding + transaction data
            Map<String, Object> branding = templateService.getDefaultBranding(tenantId);
            Map<String, Object> parameters = new HashMap<>(branding);
            parameters.put("receiptNo", receiptNo);
            parameters.put("paymentDate", firstTx.getTransactionDate().toLocalDate().toString());
            parameters.put("studentName", firstTx.getStudentName());
            parameters.put("studentId", firstTx.getStudentId() != null ? firstTx.getStudentId() : "");
            parameters.put("offeringName", firstTx.getOfferingName() != null ? firstTx.getOfferingName() : "");
            parameters.put("paymentMode", firstTx.getPaymentMode());
            parameters.put("academicSession", firstTx.getAcademicYear() != null ? firstTx.getAcademicYear() : "");
            parameters.put("totalAmount", totalAmount);
            parameters.put("amountInWords", NumberToWords.convert(totalAmount));

            // 4. Prepare Data Source
            JRBeanCollectionDataSource dataSource = new JRBeanCollectionDataSource(transactions);

            // 5. Load & Compile Template
            ClassPathResource resource = new ClassPathResource("reports/fee_receipt.jrxml");
            JasperReport jasperReport;
            try (InputStream is = resource.getInputStream()) {
                jasperReport = JasperCompileManager.compileReport(is);
            }

            // 6. Fill Report
            JasperPrint jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, dataSource);

            // 7. Export to File
            File dir = new File(storagePath);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String fileName = "Receipt_" + receiptNo + ".pdf";
            String filePath = storagePath + fileName;

            try (FileOutputStream fos = new FileOutputStream(filePath)) {
                JasperExportManager.exportReportToPdfStream(jasperPrint, fos);
            }

            log.info("Receipt PDF saved at: {}", filePath);
            return filePath;

        } catch (Exception e) {
            log.error("Failed to generate receipt PDF: {}", e.getMessage(), e);
            throw new RuntimeException("Receipt generation failed: " + e.getMessage());
        }
    }

    /**
     * Returns the PDF bytes for a receipt, regenerating if the file does not exist.
     */
    public byte[] getReceiptPdfData(String receiptNo, String tenantId, String userId, String roles) {
        log.info("Fetching PDF data for Receipt: {} (Tenant: {})", receiptNo, tenantId);

        String fileName = "Receipt_" + receiptNo + ".pdf";
        File file = new File(storagePath + fileName);

        if (!file.exists()) {
            log.warn("PDF not found for Receipt: {}, regenerating...", receiptNo);
            generateReceiptPdf(receiptNo, tenantId, userId, roles);
        }

        try {
            return java.nio.file.Files.readAllBytes(file.toPath());
        } catch (Exception e) {
            log.error("Failed to read receipt PDF file: {}", e.getMessage());
            throw new RuntimeException("Could not read receipt PDF");
        }
    }
}
