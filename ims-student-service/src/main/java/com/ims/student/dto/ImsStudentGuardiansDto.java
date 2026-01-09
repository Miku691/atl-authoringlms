package com.ims.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStudentGuardiansDto {
    private String id;
    private String studentId;
    private String guardianName;
    private String relation;
    private String phone;
    private String email;
    private String occupation;
    private String address;
    private boolean isDeleted;
    private Instant createdAt;
    private Instant updatedAt;
}
