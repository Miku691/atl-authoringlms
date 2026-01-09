package com.ims.academic.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsOfferingSubjectsDto {

    private String id;
    private String offeringId;
    private String subjectId;
    private Integer orderIndex;
    private BigDecimal weight;
}
