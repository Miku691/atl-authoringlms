package com.ims.platform.dto;

import com.ims.platform.enums.DemoRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemoRequestDto {
    private String id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String instituteName;
    private String estimatedStudents;
    private LocalDate preferredDate;
    private LocalTime preferredTime;
    private DemoRequestStatus status;
    private String meetingLink;
    private String adminFeedback;
    private LocalDateTime createdAt;
}
