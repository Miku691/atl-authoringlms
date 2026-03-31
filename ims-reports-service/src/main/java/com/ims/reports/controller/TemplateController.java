package com.ims.reports.controller;

import com.ims.reports.entity.ReportTemplate;
import com.ims.reports.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    /**
     * Retrieves the template of a given type for the current tenant.
     *
     * @param type           the template type (e.g., INVOICE)
     * @param authentication the filtered authentication from gateway
     * @return the template config
     */
    @GetMapping("/{type}")
    public ResponseEntity<ReportTemplate> getTemplate(
            @PathVariable String type,
            Authentication authentication) {

        String tenantId = (String) authentication.getDetails();
        return templateService.getTemplate(tenantId, type)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Saves or updates a template config for the current tenant.
     *
     * @param type           the template type
     * @param config         the JSON config string (request body)
     * @param authentication the filtered authentication from gateway
     * @return the saved template
     */
    @PostMapping("/{type}")
    public ResponseEntity<ReportTemplate> saveTemplate(
            @PathVariable String type,
            @RequestBody String config,
            Authentication authentication) {

        String tenantId = (String) authentication.getDetails();
        ReportTemplate saved = templateService.saveTemplate(tenantId, type, config);
        return ResponseEntity.ok(saved);
    }
}
