package com.authoring.tool.services.impl;

import com.authoring.tool.dto.AtlCourseWOSlideDto;
import com.authoring.tool.utility.ApiResponse;
import com.authoring.tool.utility.ApiResponsePage;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.authoring.tool.dto.AtlCourseDto;
import com.authoring.tool.entity.AtlCourse;
import com.authoring.tool.exception.DetailsNotFoundException;
import com.authoring.tool.repo.AtlCourseRepo;
import com.authoring.tool.services.AtlCourseService;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
public class AtlCourseServiceImpl implements AtlCourseService {

	private final ModelMapper modelMapper;
	private final AtlCourseRepo courseRepo;
	
	@Override
	public AtlCourseDto saveAtlCourse(AtlCourseDto course) {
		AtlCourse savedCourse = courseRepo.save(modelMapper.map(course, AtlCourse.class));
		return modelMapper.map(savedCourse, AtlCourseDto.class);
	}

    @Override
	public AtlCourseDto getAtlCourseById(Long courseId) {
		AtlCourse courseObj = courseRepo.findById(courseId).orElseThrow(() -> new DetailsNotFoundException("courseId", courseId.toString()));
		return modelMapper.map(courseObj, AtlCourseDto.class);
	}

    @Override
    public ApiResponsePage<AtlCourseWOSlideDto> getPaginatedCoursed(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Page<AtlCourse> coursePage = courseRepo.findAll(pageable);

        List<AtlCourse> courseObj = coursePage.getContent();

        ApiResponsePage<AtlCourseWOSlideDto> response = new ApiResponsePage<>();
        response.setContent(courseObj.stream().map(course -> modelMapper.map(course, AtlCourseWOSlideDto.class))
                        .collect(Collectors.toList()));
        response.setTotalElement(coursePage.getTotalElements());
        response.setTotalPage(coursePage.getTotalPages());
        response.setCurrentPage(coursePage.getNumber());
        response.setFirst(coursePage.isFirst());
        response.setLast(coursePage.isLast());

        return response;
    }

}
