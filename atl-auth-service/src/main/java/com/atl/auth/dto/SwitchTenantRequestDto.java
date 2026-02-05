package com.atl.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SwitchTenantRequestDto {
    @NotBlank(message = "Target Tenant ID is required")
    private String targetTenantId;
}
