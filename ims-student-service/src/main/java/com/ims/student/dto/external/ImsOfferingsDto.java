package com.ims.student.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsOfferingsDto {
    private String id;
    private String name;
    private String type;
    private LocalDate startDate;
    private LocalDate endDate;
    private String status; // ACTIVE, INACTIVE, UPCOMING
    private String sessionId;
    private String sessionStatus;
}
