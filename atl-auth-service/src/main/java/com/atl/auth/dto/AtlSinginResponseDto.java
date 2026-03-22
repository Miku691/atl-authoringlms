package com.atl.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtlSinginResponseDto {
    private String username;
    private String email;
    private boolean passwordResetRequired;
    private String tenantId;
    private String tenantName;
    private String currency;
}
