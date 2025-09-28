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
public class AtlComponentTextDto {
	private Long Id;
	private String text;
	
	private AtlSlides slide;
}
