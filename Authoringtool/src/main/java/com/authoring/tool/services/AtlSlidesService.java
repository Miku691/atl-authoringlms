package com.authoring.tool.services;

import com.authoring.tool.dto.AtlSlidesDto;
import com.authoring.tool.dto.AtlSlidesWithComponentDto;
import com.authoring.tool.dto.AtlSlidesWithoutCourseDto;

public interface AtlSlidesService {
	AtlSlidesDto saveSlide(AtlSlidesDto slideDto);
	AtlSlidesWithComponentDto getSlideById(Long slideId);

    AtlSlidesWithoutCourseDto updateSlideData(AtlSlidesDto updatedSlideDto);
}