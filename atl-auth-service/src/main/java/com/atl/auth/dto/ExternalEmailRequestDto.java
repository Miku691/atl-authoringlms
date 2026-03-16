package com.atl.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * DTO for calling the External Notification Service.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExternalEmailRequestDto {
    private String to;
    private String subject;
    private String body;
    private String templateName;
    private Map<String, Object> templateData;
    private boolean isHtml;
}
