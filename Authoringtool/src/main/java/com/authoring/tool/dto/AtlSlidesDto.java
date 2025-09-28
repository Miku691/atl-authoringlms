package com.authoring.tool.dto;

import com.authoring.tool.entity.AtlCourse;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtlSlidesDto {
	private Long id;
	private String title;
	private String desc;
	private Integer index;
	
	private AtlCourse course;
}
