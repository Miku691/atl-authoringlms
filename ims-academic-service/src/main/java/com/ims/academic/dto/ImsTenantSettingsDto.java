package com.ims.academic.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsTenantSettingsDto {

    private String tenantId;
    private String settings;
    private LocalDateTime updatedAt;
}
