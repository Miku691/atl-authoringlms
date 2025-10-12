package com.authoring.tool.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

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
	private String description;
	private String author;
	
	@JsonFormat(pattern = "dd/MM/YYYY")
	private LocalDateTime createdOn;
	@JsonFormat(pattern = "dd/MM/YYYY")
	private LocalDateTime updatedOn;
	private String status;
	
	private List<AtlSlidesWithoutCourseDto> slides;
}
