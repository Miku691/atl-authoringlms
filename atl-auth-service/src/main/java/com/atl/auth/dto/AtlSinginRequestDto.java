package com.atl.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtlSinginRequestDto {
    @NotBlank(message = "Username is required")
    @Pattern(regexp = "^\\S+$", message = "Username must not contain spaces")
    private String username;

    @Email(message = "Email must be valid")
    private String email;

    private String password;

    private String tenantId;
    private String roleCode;
}