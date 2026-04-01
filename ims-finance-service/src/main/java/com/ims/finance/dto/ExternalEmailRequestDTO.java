package com.ims.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Data Transfer Object for sending email requests to the notification service.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExternalEmailRequestDTO {
    private String to;
    private String subject;
    private String body;
    private String templateName;
    private Map<String, Object> templateData;
    private boolean isHtml;
    private String attachmentPath; // Added for invoice attachment
}
