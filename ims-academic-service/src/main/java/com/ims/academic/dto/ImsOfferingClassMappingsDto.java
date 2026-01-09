package com.ims.academic.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsOfferingClassMappingsDto {

    private String id;
    private String offeringId;
    private String classId;
    private String sectionId;
}
