package com.authoring.tool.dto;

import com.authoring.tool.entity.AtlSlides;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtlComponentMcqDto {
    private Long id;
    private String mcqId;
    private AtlSlides slide;
}
