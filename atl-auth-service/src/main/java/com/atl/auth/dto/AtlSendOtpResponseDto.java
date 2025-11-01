package com.atl.auth.dto;

import lombok.*;

@Getter
@Setter
@Builder
public class AtlSendOtpResponseDto {
    private String username;
    private String message;
}
