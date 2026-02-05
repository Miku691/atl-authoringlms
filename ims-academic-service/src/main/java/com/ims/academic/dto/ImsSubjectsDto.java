package com.ims.academic.dto;

import com.ims.academic.enums.SubjectType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImsSubjectsDto {

    private String id;
    private String code;
    private String title;
    private SubjectType subjectType;
    private Integer totalExamMarks;
}
