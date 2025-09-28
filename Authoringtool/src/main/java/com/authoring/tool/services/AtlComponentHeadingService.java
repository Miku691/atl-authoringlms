package com.authoring.tool.services;

import com.authoring.tool.dto.AtlComponentHeadingDto;

import com.authoring.tool.dto.AtlHeadingWOSlideDto;

public interface AtlComponentHeadingService {
	AtlComponentHeadingDto saveComponentHeading(AtlComponentHeadingDto headingDto);
	AtlHeadingWOSlideDto getComponentHeading(Long headingId);
}

