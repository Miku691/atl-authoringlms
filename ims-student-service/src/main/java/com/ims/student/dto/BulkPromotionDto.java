package com.ims.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkPromotionDto {
    private String targetOfferingId;
    private String targetAcademicYear;
    private List<String> studentIds;
    private String action; // PROMOTE, REPEAT, COMPLETED
    private String newStatus; // To match frontend payload
}
