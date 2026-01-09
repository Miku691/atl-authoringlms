package com.ims.academic.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsSyllabusItemsDto {

    private String id;
    private String chapterId;
    private String title;
    private String summary;
}
