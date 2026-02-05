package com.ims.student.dto;

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
public class ImsStudentsDto {
    private String id;
    private String userId;
    private String tenantId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private LocalDate dob;
    private String gender;
    private String bloodGroup;
    private String admissionNo;
    private LocalDate admissionDate;
    private String category;
    private String religion;
    private String profileImageUrl;
    private String status;
    private boolean isDeleted;
    private String address;
    private String medicalHistory;
    private String previousEducation;
    private String birthFormId;
    private Boolean isOrphan;
    private String caste;
    private String previousSchool;
    private Double admissionDiscount;
    private Instant createdAt;
    private Instant updatedAt;
}
