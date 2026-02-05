package com.ims.student.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
