package com.atl.auth.dto;

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
    private boolean ready;
    private List<String> missingComponents;
    private String tenantType;
}
