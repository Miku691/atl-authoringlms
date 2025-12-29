package com.ims.instructor.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsInstructorSubjectsDto {

    private String id;
    private String instructorId;
    private String subjectId;
    private String level;
    private Instant createdAt;
}
