package com.ims.academic.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsInstructorClassMappingsDto {

    private String id;
    private String instructorId;
    private String classId;
    private String sectionId;
}
