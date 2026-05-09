package com.ims.academic.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsBranchesDto {
    private String id;
    private String tenantId;
    private String programId;
    private String name;
    private String code;
}
