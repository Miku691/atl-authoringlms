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
public class AtlMediaAssestsDto {
	private Long id;
	private String fileName;
	private String fileUrl;
	private String fileType;
	private String uploadedBy;
	@JsonFormat(pattern = "dd/MM/yyyy")
	private LocalDate uploadedOn;
}
