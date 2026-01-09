package com.ims.academic.dto;

import com.ims.academic.enums.AttendanceStatus;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsAttendanceRecordsDto {

    private String id;
    private String attendanceMasterId;
    private String studentId;
    private AttendanceStatus status;
    private String remarks;
}
