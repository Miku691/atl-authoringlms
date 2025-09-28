package com.authoring.tool.dto;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtlComponentStylesDto {
	private Long id;
	
	private Long componentId;
	private String componentType;
	private String styleJson;
	@JsonFormat(pattern = "dd/MM/yyyy")
	private LocalDate createdOn;
}
