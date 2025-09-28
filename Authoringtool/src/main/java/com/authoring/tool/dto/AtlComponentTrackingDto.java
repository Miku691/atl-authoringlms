package com.authoring.tool.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtlComponentTrackingDto {
	private Long id;
	private Long sliceId;
	private Long componentId;
	private String componentType;
}
