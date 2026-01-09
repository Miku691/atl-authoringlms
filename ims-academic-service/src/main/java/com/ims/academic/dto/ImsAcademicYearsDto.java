package com.ims.academic.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsAcademicYearsDto {

    private String id;
    private String tenantId;
    private String label;
    private LocalDate startDate;
    private LocalDate endDate;
}
