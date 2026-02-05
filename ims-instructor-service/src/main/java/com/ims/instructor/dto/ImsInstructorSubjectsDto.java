package com.ims.instructor.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsInstructorSubjectsDto {
    private String id;
    private String instructorId;
    private String subjectId;
    private String subjectName; // For UI
    private String level; // PRIMARY, SECONDARY
}
