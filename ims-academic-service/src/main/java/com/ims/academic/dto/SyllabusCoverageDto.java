package com.ims.academic.dto;

import com.ims.academic.enums.CoverageStatus;
import lombok.*;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyllabusCoverageDto {
    private String id;
    private String offeringSubjectId;
    private String topicId;
    private String topicTitle; // UI convenience
    private CoverageStatus status;
    private Instant completedAt;
    private String completedBy;
}
