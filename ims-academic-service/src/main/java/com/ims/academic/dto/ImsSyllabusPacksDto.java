package com.ims.academic.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsSyllabusPacksDto {

    private String id;
    private String tenantId;
    private String title;
    private String board;
}
