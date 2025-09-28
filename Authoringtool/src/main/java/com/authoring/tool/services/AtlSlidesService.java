package com.authoring.tool.services;

import com.authoring.tool.dto.AtlSlidesDto;
import com.authoring.tool.dto.AtlSlidesWithComponentDto;

public interface AtlSlidesService {
	AtlSlidesDto saveSlide(AtlSlidesDto slideDto);
	AtlSlidesWithComponentDto getSlideById(Long slideId);
}