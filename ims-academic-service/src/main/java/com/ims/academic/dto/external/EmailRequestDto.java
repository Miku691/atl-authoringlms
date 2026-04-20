package com.ims.academic.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequestDto {
    private String to;
    private String subject;
    private String body;
    private String tenantId;
}
