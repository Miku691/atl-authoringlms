package com.ims.academic.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsOfferingInstructorsDto {

    private String id;
    private String offeringId;
    private String instructorId;
    private String subjectId;
    private String role;
}
