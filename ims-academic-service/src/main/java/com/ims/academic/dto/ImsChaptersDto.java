package com.ims.academic.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsChaptersDto {
    private String id;
    private String offeringSubjectId;
    private String title;
    private Integer orderIndex;
    private String levelId;
    private String subjectId;
}
