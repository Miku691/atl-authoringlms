package com.ims.academic.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsTopicsDto {
    private String id;
    private String chapterId;
    private String title;
    private String summary;
    private Integer orderIndex;
}
