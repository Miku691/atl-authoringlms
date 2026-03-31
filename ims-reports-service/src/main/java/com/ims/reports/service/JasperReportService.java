package com.ims.reports.service;

import com.ims.reports.dto.ReportRequestDto;
import com.ims.reports.exception.ImsReportsException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.export.JRCsvExporter;
import net.sf.jasperreports.engine.export.ooxml.JRXlsxExporter;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import net.sf.jasperreports.export.SimpleWriterExporterOutput;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class JasperReportService {

    private final DataSource dataSource;

    public byte[] generateReport(ReportRequestDto request, String tenantId) {
        log.info("Generating report: {} in format: {} for tenant: {}", request.getReportName(), request.getFormat(), tenantId);
        
        try (Connection connection = dataSource.getConnection()) {
            // 1. Load the JRXML template
            String templatePath = "reports/" + request.getReportName() + ".jrxml";
            ClassPathResource resource = new ClassPathResource(templatePath);
            
            if (!resource.exists()) {
                log.error("Report template not found: {}", templatePath);
                throw new ImsReportsException("Report template '" + request.getReportName() + "' was not found in the system.");
            }

            JasperReport jasperReport;
            try (InputStream jrxmlStream = resource.getInputStream()) {
                // 2. Compile the report
                jasperReport = JasperCompileManager.compileReport(jrxmlStream);
            } catch (Exception e) {
                log.error("Failed to compile JRXML template: {}", templatePath, e);
                throw new ImsReportsException("Technical error: Failed to compile the report template. Please check the JRXML schema.");
            }

            // 3. Prepare parameters
            Map<String, Object> parameters = request.getParameters() != null ? 
                    new HashMap<>(request.getParameters()) : new HashMap<>();
            
            parameters.put("param_tenant_id", tenantId);
            
            if (request.getStartDate() != null) {
                parameters.put("param_start_date", java.sql.Date.valueOf(request.getStartDate()));
            }
            if (request.getEndDate() != null) {
                parameters.put("param_end_date", java.sql.Date.valueOf(request.getEndDate()));
            }

            // 4. Fill the report with data from the database
            JasperPrint jasperPrint;
            try {
                jasperPrint = JasperFillManager.fillReport(jasperReport, parameters, connection);
            } catch (JRException e) {
                log.error("Failed to fill report with data for tenant: {}", tenantId, e);
                throw new ImsReportsException("Failed to populate report with data. There may be an issue with the database query or parameters.");
            }

            // 5. Export to requested format
            return exportReport(jasperPrint, request.getFormat());

        } catch (ImsReportsException e) {
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error during report generation", e);
            throw new ImsReportsException("An unexpected error occurred: " + e.getMessage());
        }
    }

    private byte[] exportReport(JasperPrint jasperPrint, String format) throws JRException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        String upperFormat = format == null ? "PDF" : format.toUpperCase();

        switch (upperFormat) {
            case "EXCEL":
            case "XLSX":
                JRXlsxExporter xlsxExporter = new JRXlsxExporter();
                xlsxExporter.setExporterInput(new SimpleExporterInput(jasperPrint));
                xlsxExporter.setExporterOutput(new SimpleOutputStreamExporterOutput(outputStream));
                xlsxExporter.exportReport();
                break;
            case "CSV":
                JRCsvExporter csvExporter = new JRCsvExporter();
                csvExporter.setExporterInput(new SimpleExporterInput(jasperPrint));
                csvExporter.setExporterOutput(new SimpleWriterExporterOutput(outputStream));
                csvExporter.exportReport();
                break;
            default:
                throw new ImsReportsException("Unsupported report format: " + format);
        }

        return outputStream.toByteArray();
    }
}
