package com.authoring.tool.dto.custom;

import com.authoring.tool.dto.AtlSlideComponentDto;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtlTextDto extends AtlSlideComponentDto {
    private String text;
}