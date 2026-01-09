package com.ims.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcademicReadinessDto {

    private boolean isReady;
    private List<String> missingComponents;
    private String tenantType;
}
