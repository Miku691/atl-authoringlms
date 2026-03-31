package com.ims.reports.service;

import com.ims.reports.entity.ReportTemplate;
import com.ims.reports.repository.ReportTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final ReportTemplateRepository repository;
    private final com.ims.reports.client.AuthServiceClient authServiceClient;
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper;

    /**
     * Gets the template for a specific tenant and type.
     * If not found, fetches tenant details via Feign to provide smart defaults.
     *
     * @param tenantId     the tenant ID
     * @param templateType the type of template (e.g., INVOICE)
     * @return the template entity (localized or virtual default)
     */
    public Optional<ReportTemplate> getTemplate(String tenantId, String templateType) {
        Optional<ReportTemplate> existing = repository.findByTenantIdAndTemplateType(tenantId, templateType);
        
        if (existing.isPresent()) {
            return existing;
        }

        // If no template found, try to generate a default one populated with tenant data
        if ("INVOICE".equalsIgnoreCase(templateType)) {
            return Optional.of(generateDefaultInvoiceTemplate(tenantId));
        }

        return existing;
    }

    private ReportTemplate generateDefaultInvoiceTemplate(String tenantId) {
        String institutionName = "Your Institute Name";
        String address = "123 Academic Street, Education City";
        String contact = "+1 234 567 8900";
        String email = "info@institute.com";

        try {
            java.util.Map<String, Object> response = authServiceClient.getTenantById(tenantId);
            if (response != null && "SUCCESS".equals(response.get("status"))) {
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> data = (java.util.Map<String, Object>) response.get("apiData");
                if (data != null) {
                    institutionName = (String) data.getOrDefault("tenantName", institutionName);
                    address = (String) data.getOrDefault("address", address);
                    contact = (String) data.getOrDefault("contactPhone", contact);
                    email = (String) data.getOrDefault("contactEmail", email);
                }
            }
        } catch (Exception e) {
            // Log error but proceed with hardcoded defaults
            System.err.println("Failed to fetch tenant details via Feign: " + e.getMessage());
        }

        // Construct the default JSON matching Frontend's InvoiceConfig
        java.util.Map<String, Object> defaultConfig = new java.util.HashMap<>();
        defaultConfig.put("institutionName", institutionName);
        defaultConfig.put("address", address);
        defaultConfig.put("contact", contact);
        defaultConfig.put("email", email);
        defaultConfig.put("website", "www.institute.com");
        defaultConfig.put("logoUrl", "");
        defaultConfig.put("primaryColor", "#4f46e5");
        defaultConfig.put("accentColor", "#f3f4f6");
        defaultConfig.put("fontFamily", "Inter");
        defaultConfig.put("showLogo", true);
        defaultConfig.put("showStudentPhoto", false);
        defaultConfig.put("showBalanceDue", true);
        defaultConfig.put("showPreviousDues", true);
        defaultConfig.put("receiptPrefix", "RCPT-");
        defaultConfig.put("footerNote", "This is a computer-generated receipt.");
        defaultConfig.put("termsAndConditions", "1. Fees once paid are not refundable.\n2. Please keep this receipt for future reference.");

        try {
            String configJson = objectMapper.writeValueAsString(defaultConfig);
            return ReportTemplate.builder()
                    .tenantId(tenantId)
                    .templateType("INVOICE")
                    .config(configJson)
                    .build();
        } catch (Exception e) {
            return ReportTemplate.builder().tenantId(tenantId).templateType("INVOICE").config("{}").build();
        }
    }

    /**
     * Creates or updates a template config.
     *
     * @param tenantId     the tenant ID
     * @param templateType the type of template
     * @param config       the JSON config string
     * @return the saved template
     */
    @Transactional
    public ReportTemplate saveTemplate(String tenantId, String templateType, String config) {
        return repository.findByTenantIdAndTemplateType(tenantId, templateType)
                .map(existing -> {
                    existing.setConfig(config);
                    return repository.save(existing);
                })
                .orElseGet(() -> {
                    ReportTemplate newTemplate = ReportTemplate.builder()
                            .tenantId(tenantId)
                            .templateType(templateType)
                            .config(config)
                            .build();
                    return repository.save(newTemplate);
                });
    }
}
