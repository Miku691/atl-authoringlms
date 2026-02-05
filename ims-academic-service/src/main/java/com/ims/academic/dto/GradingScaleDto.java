package com.ims.academic.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GradingScaleDto {
    private String id;
    private String gradeLabel;
    private Double minPercentage;
    private Double maxPercentage;
    private Double gradePoint;
    private String description;
    private String tenantId;
}
