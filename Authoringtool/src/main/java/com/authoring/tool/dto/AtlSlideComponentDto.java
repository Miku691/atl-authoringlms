package com.authoring.tool.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtlSlideComponentDto {
    private Long id;
    private int orderIndex;
    private String type;
}