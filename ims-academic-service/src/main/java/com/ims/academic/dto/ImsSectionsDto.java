package com.ims.academic.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsSectionsDto {

    private String id;
    private String tenantId;
    private String classId;
    private String name;
}
