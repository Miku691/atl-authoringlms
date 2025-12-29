package com.atl.auth.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AtlValidationErrorDto {
    private String field;
    private String errorMsg;
}
