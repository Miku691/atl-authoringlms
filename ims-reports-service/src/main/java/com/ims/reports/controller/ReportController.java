package com.ims.reports.controller;

import com.ims.reports.dto.ReportRequestDto;
import com.ims.reports.service.JasperReportService;
import com.ims.reports.service.ReceiptGeneratorService;
import com.ims.reports.util.ApiResponse;
import com.ims.reports.util.SecurityConstant;
import com.ims.reports.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final JasperReportService jasperReportService;
    private final ReceiptGeneratorService receiptGeneratorService;

    @PostMapping("/generate-invoice")
    public ResponseEntity<ApiResponse<String>> generateInvoice(
            @RequestParam String receiptNo,
            @RequestHeader(SecurityConstant.USER_ID_HEADER) String userId,
            @RequestHeader(SecurityConstant.ROLES_HEADER) String roles,
            @RequestHeader(SecurityConstant.TENANT_ID_HEADER) String tenantId) {
        String path = receiptGeneratorService.generateReceiptPdf(receiptNo, tenantId, userId, roles);
        return ResponseEntity
                .ok(ApiResponse.success(HttpStatus.OK.value(), "Invoice PDF generated successfully", path));
    }

    @GetMapping("/download-receipt")
    public ResponseEntity<byte[]> downloadReceipt(@RequestParam String receiptNo) {
        try {
            String tenantId = SecurityUtils.getCurrentTenantId();
            String userId = SecurityUtils.getCurrentUserId();
            String roles = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.joining(","));
                    
            byte[] reportData = receiptGeneratorService.getReceiptPdfData(receiptNo, tenantId, userId, roles);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "Receipt_" + receiptNo + ".pdf");

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(reportData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'ADMIN')")
    public ResponseEntity<byte[]> generateReport(
            @RequestBody ReportRequestDto request,
            @RequestHeader(value = SecurityConstant.TENANT_ID_HEADER) String tenantId) {

        byte[] reportData = jasperReportService.generateReport(request, tenantId);

        String format = request.getFormat() != null ? request.getFormat().toUpperCase() : "PDF";
        String filename = request.getReportName() + "_" + System.currentTimeMillis();

        HttpHeaders headers = new HttpHeaders();

        switch (format) {
            case "EXCEL":
            case "XLSX":
                headers.setContentType(
                        MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
                headers.setContentDispositionFormData("attachment", filename + ".xlsx");
                break;
            case "CSV":
                headers.setContentType(MediaType.valueOf("text/csv"));
                headers.setContentDispositionFormData("attachment", filename + ".csv");
                break;
            case "PDF":
            default:
                headers.setContentType(MediaType.APPLICATION_PDF);
                headers.setContentDispositionFormData("inline", filename + ".pdf");
                break;
        }

        return ResponseEntity.ok()
                .headers(headers)
                .body(reportData);
    }
}
