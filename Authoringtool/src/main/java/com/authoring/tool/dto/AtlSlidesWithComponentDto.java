package com.authoring.tool.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtlSlidesWithComponentDto {
	private Long id;
	private String title;
	private String description;
	private Integer orderIndex;
	
	//List<AtlHeadingWOSlideDto> components;
    List<AtlSlideComponentDto> components;
}
