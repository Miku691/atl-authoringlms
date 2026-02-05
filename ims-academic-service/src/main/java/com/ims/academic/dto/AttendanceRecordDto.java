package com.ims.academic.dto;

import com.ims.academic.enums.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRecordDto {
    private String id;
    private String personId;
    private String personName; // For UI convenience
    private String personType; // STUDENT, INSTRUCTOR, STAFF
    private String offeringId;
    private String subjectId;
    private LocalDate date;
    private AttendanceStatus status;
    private String remarks;
}
