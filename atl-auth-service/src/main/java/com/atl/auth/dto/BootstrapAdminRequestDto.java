package com.atl.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BootstrapAdminRequestDto {
    private String adminName;
    private String email;
    private String phone;
    private String password;
}
