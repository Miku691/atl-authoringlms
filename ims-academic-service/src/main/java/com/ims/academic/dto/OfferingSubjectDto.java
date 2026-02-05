package com.ims.academic.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OfferingSubjectDto {
    private String id;
    private String offeringId;
    private String subjectId;
    private boolean isOptional;
    private Double credits;
    private String instructorId;
    private String subjectName; // For UI convenience
}
