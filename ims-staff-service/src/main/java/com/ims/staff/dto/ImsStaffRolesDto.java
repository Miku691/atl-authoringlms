package com.ims.staff.dto;

import com.ims.staff.enums.StaffRoleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStaffRolesDto {

    private String id;
    private String staffId;
    private StaffRoleType roleName;
    private Instant assignedAt;
}
