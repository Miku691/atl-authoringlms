package com.ims.student.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsClassesDto {
    private String id;
    private String tenantId;
    private String name;
    private String code;
    private String offeringId;
    private String offeringName;
}
