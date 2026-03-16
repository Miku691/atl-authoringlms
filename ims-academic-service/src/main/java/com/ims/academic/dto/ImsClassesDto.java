package com.ims.academic.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsClassesDto {

    private String id;
    private String tenantId;
    private String name;
    private String code;
    private Integer capacity;
    private String programId;
}
