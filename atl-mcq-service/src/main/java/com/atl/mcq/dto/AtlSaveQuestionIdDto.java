package com.atl.mcq.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AtlSaveQuestionIdDto {
    private String mcqId;
    private SlideDto slide;
}
