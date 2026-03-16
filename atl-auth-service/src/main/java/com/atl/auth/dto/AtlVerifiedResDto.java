package com.atl.auth.dto;

import com.atl.auth.enums.TenantType;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Getter
@Setter
@Builder
public class AtlVerifiedResDto {
    private String id;
    private String username;
    private String jwt;
    private Set<String> roles;
    private String tenantId;
    private String email;
    private Boolean tenantSetupCompleted;
    private TenantType tenantType;
    private boolean passwordResetRequired;
}
