package com.ims.instructor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthSignupRequestDto {
    private String username;
    private String email;
    private String password;
    private String tenantId;
    private String roleCode;
}
