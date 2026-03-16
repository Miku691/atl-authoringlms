package com.ims.notification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Data Transfer Object for email notifications.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequestDto {

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid email format")
    private String to;

    @NotBlank(message = "Subject is required")
    private String subject;

    private String body;

    private String templateName;

    private Map<String, Object> templateData;

    private boolean isHtml;
}
