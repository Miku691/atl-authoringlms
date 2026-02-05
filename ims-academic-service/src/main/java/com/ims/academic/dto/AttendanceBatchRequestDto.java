package com.ims.academic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceBatchRequestDto {
    private String offeringId;
    private String subjectId;
    private LocalDate date;
    private String personType; // STUDENT or STAFF
    private List<AttendanceRecordDto> records;
}
