package com.ims.academic.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcademicSessionDto {
    private String id;
    private String tenantId;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isCurrent;
    private String programId;
}
