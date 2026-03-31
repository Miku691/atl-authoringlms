package com.ims.reports.controller;

import com.ims.reports.dto.ReportRequestDto;
import com.ims.reports.service.JasperReportService;
import com.ims.reports.util.SecurityConstant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final JasperReportService jasperReportService;

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
                headers.setContentType(MediaType.valueOf("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
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
