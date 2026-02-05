package com.ims.academic.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceSummaryDto {
    private long totalDays;
    private long presentDays;
    private long absentDays;
    private long leaveDays;
    private long lateDays;
    private double attendancePercentage;
}
