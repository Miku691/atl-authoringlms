package com.ims.student.dto;

import lombok.*;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsGuardiansDto {
    private String id;
    private String tenantId;
    private String userId;
    private String name;
    private String phone;
    private String email;
    private String occupation;
    private String address;
    private String relation; // For mapping context
    private boolean isPrimary; // For mapping context
    private Instant createdAt;
    private Instant updatedAt;
}
