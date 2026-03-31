package com.ims.instructor.dto;

import lombok.*;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsInstructorsDto {
    private String id;
    private String tenantId;
    private String userId;
    private String firstName;
    private String lastName;
    private String qualification;
    private String experience;
    private String specialization;
    private Double monthlySalary;
    private LocalDate joinDate;
    private String email;
    private String phone;
    private String employeeId;
    private LocalDate dob;
    private String gender;
    private String address;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
}
