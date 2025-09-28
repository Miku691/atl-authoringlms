package com.authoring.tool.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtlCourseDto {
	private long id;
	private String title;
	private String desc;
	private String author;
	private LocalDateTime createdOn;
	private LocalDateTime updatedOn;
	private String status;
	
	private List<AtlSlidesWithoutCourseDto> slides;
}
