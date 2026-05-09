package com.ims.academic.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsYearsDto {
    private String id;
    private String tenantId;
    private String branchId;
    private String name;
    private Integer yearNumber;
}
