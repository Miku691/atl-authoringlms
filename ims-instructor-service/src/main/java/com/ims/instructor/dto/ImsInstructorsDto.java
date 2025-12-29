package com.ims.instructor.dto;

import lombok.*;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsInstructorsDto {
    private String id;
    private String tenantId;
    private String userId;
    private String firstName;
    private String lastName;
    private String qualification;
    private Integer experienceYears;
    private String specialization;
    private LocalDate joinDate;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
}
