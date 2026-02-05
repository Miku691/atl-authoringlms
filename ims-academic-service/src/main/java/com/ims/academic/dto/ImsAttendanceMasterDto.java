package com.ims.academic.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsAttendanceMasterDto {

    private String id;
    private String tenantId;
    private String offeringId;
    private String subjectId;
    private LocalDate date;
    private String status;
    private String takenBy;
    private String notes;
    private List<ImsAttendanceRecordsDto> records;
}
