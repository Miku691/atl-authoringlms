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

    /**
     * Returns a flattened map of branding parameters, merging saved config with defaults.
     */
    public java.util.Map<String, Object> getFlattenedConfig(String tenantId, String type) {
        java.util.Map<String, Object> finalConfig = getDefaultBranding(tenantId);
        
        getTemplate(tenantId, type).ifPresent(template -> {
            try {
                java.util.Map<String, Object> saved = objectMapper.readValue(template.getConfig(), 
                        new com.fasterxml.jackson.core.type.TypeReference<java.util.AbstractMap.SimpleEntry<String, Object>>() {}.getClass() == null ? null : 
                        new com.fasterxml.jackson.core.type.TypeReference<java.util.Map<String, Object>>() {});
                if (saved != null) {
                    finalConfig.putAll(saved);
                }
            } catch (Exception e) {
                // Fallback to defaults already in finalConfig
            }
        });
        
        return finalConfig;
    }

    public java.util.Map<String, Object> getDefaultBranding(String tenantId) {
        java.util.Map<String, Object> branding = new java.util.HashMap<>();
        branding.put("institutionName", "Your Institute Name");
        branding.put("address", "123 Academic Street, Education City");
        branding.put("contact", "+1 234 567 8900");
        branding.put("email", "info@institute.com");
        branding.put("website", "www.institute.com");
        branding.put("logoUrl", "");
        branding.put("primaryColor", "#4f46e5");
        branding.put("accentColor", "#f3f4f6");
        branding.put("fontFamily", "Inter");
        branding.put("showLogo", true);
        branding.put("showStudentPhoto", false);
        branding.put("showBalanceDue", true);
        branding.put("showPreviousDues", true);
        branding.put("receiptPrefix", "RCPT-");
        branding.put("footerNote", "This is a computer-generated receipt.");
        branding.put("termsAndConditions", "1. Fees once paid are not refundable.\n2. Please keep this receipt for future reference.");

        try {
            java.util.Map<String, Object> response = authServiceClient.getTenantById(tenantId);
            if (response != null && "SUCCESS".equals(response.get("status"))) {
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> data = (java.util.Map<String, Object>) response.get("apiData");
                if (data != null) {
                    branding.put("institutionName", data.getOrDefault("tenantName", branding.get("institutionName")));
                    branding.put("address", data.getOrDefault("address", branding.get("address")));
                    branding.put("contact", data.getOrDefault("contactPhone", branding.get("contact")));
                    branding.put("email", data.getOrDefault("contactEmail", branding.get("email")));
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch tenant details via Feign: " + e.getMessage());
        }
        return branding;
    }

    private ReportTemplate generateDefaultInvoiceTemplate(String tenantId) {
        java.util.Map<String, Object> branding = getDefaultBranding(tenantId);

        try {
            String configJson = objectMapper.writeValueAsString(branding);
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
