package com.ims.academic.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentAssignmentSummaryDto {
    private long totalAssignments;
    private long completedAssignments;
    private long pendingAssignments;
}
