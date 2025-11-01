package com.authoring.tool.services;

import com.authoring.tool.dto.AtlCourseDto;
import com.authoring.tool.dto.AtlCourseWOSlideDto;
import com.authoring.tool.utility.ApiResponse;
import com.authoring.tool.utility.ApiResponsePage;

import java.util.List;

public interface AtlCourseService {
	AtlCourseDto saveAtlCourse(AtlCourseDto course);
	AtlCourseDto getAtlCourseById(Long courseId);

    ApiResponsePage<AtlCourseWOSlideDto> getPaginatedCoursed(int page, int size);

    AtlCourseDto updateCourseInfo(AtlCourseDto course);
}