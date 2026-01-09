package com.ims.academic.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsAssignmentsDto {

    private String id;
    private String offeringId;
    private String subjectId;
    private String title;
    private String description;
    private LocalDateTime dueDate;
    private String createdBy;
    private List<ImsAssignmentSubmissionsDto> submissions;
}
