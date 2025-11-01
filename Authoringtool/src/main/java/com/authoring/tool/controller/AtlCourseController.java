package com.authoring.tool.controller;

import com.authoring.tool.dto.AtlCourseWOSlideDto;
import com.authoring.tool.utility.ApiResponsePage;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.authoring.tool.dto.AtlCourseDto;
import com.authoring.tool.services.AtlCourseService;

import lombok.RequiredArgsConstructor;

import java.util.List;

@RestController
@RequestMapping("course")
@RequiredArgsConstructor
public class AtlCourseController {
	private final AtlCourseService courseService;
	
	@PostMapping
	public ResponseEntity<AtlCourseDto> saveCourseDetails(@RequestBody AtlCourseDto courseDto){
		return new ResponseEntity<AtlCourseDto>(courseService.saveAtlCourse(courseDto), HttpStatus.CREATED);
	}
	
	@GetMapping
	public ResponseEntity<AtlCourseDto> getCourseById(@RequestParam("courseId") Long courseId){
		return new ResponseEntity<AtlCourseDto>(courseService.getAtlCourseById(courseId), HttpStatus.OK);
	}

    //get course with pagination.
    @GetMapping("/pagination")
    public ResponseEntity<ApiResponsePage<AtlCourseWOSlideDto>> getPaginatedCourses(
            @RequestParam int page,
            @RequestParam int size
    ){
        return new ResponseEntity<ApiResponsePage<AtlCourseWOSlideDto>>(courseService.getPaginatedCoursed(page, size), HttpStatus.OK);
    }

    //update course info
    @PutMapping
    public ResponseEntity<AtlCourseDto> updateCourseInfo(@RequestBody AtlCourseDto course){
        return new ResponseEntity<AtlCourseDto>(courseService.updateCourseInfo(course), HttpStatus.OK);
    }
}
