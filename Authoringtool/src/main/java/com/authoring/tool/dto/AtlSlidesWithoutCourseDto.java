package com.authoring.tool.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtlSlidesWithoutCourseDto {
	private Long id;
	private String title;
	private String desc;
	private Integer index;
}
