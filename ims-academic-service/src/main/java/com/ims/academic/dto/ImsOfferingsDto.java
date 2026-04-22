package com.ims.academic.dto;

import com.ims.academic.enums.OfferingStatus;
import com.ims.academic.enums.OfferingType;
import lombok.*;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsOfferingsDto {

    private String id;
    private String tenantId;
    private String programId;
    private String sessionId;
    private OfferingType type;
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer capacity;
    private String classId;
    private String metadata;
    private OfferingStatus status;
}
