package com.ims.staff.dto;

import com.ims.staff.enums.RelationType;
import com.ims.staff.enums.StaffStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStaffDto {
    private String id;
    private String tenantId;
    private String userId;
    private String firstName;
    private String lastName;
    private RelationType relationType;
    private String contactNumber;
    private String email;
    private StaffStatus status;
    private Instant createdAt;
    private Instant updatedAt;
}
