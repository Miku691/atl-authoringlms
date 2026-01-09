package com.ims.academic.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsAssignmentSubmissionsDto {

    private String id;
    private String assignmentId;
    private String studentId;
    private String fileUrl;
    private LocalDateTime submittedAt;
    private BigDecimal score;
    private String feedback;
}
