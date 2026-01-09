package com.ims.academic.dto.external;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsInstructorSubjectsDto {
    private String id;
    private String instructorId;
    private String subjectId;
    private String level;
}
