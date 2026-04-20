package com.ims.platform.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequestDto {
    private String to;
    private String subject;
    private String body;
    private String templateName;
    private Map<String, Object> templateData;
    private boolean isHtml;
}
