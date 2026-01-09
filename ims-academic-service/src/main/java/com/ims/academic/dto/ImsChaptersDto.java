package com.ims.academic.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsChaptersDto {

    private String id;
    private String syllabusPackId;
    private String title;
    private Integer orderIndex;
}
