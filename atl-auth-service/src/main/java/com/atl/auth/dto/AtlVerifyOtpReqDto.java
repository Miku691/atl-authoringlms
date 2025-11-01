package com.atl.auth.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AtlVerifyOtpReqDto {
    private String username;
    private String otp;
}
