package com.ims.staff.dto;

import com.ims.staff.enums.RelationType;
import com.ims.staff.enums.StaffStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStaffDto {
    private String id;
    private String tenantId;
    private String firstName;
    private String lastName;
    private String phone;
    private String employeeId;
    private LocalDate joinDate;
    private LocalDate dob;
    private String gender;
    private String address;
    private String role;
    private String department;
    private String email;
    private StaffStatus status;
    private Instant createdAt;
    private Instant updatedAt;
    private Double monthlySalary;
    private String qualification;
    private String experience;
}
