package com.atl.auth.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AtlVerifiedResDto {
    private String username;
    private String jwt;
}
