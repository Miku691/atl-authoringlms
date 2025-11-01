package com.authoring.tool.controller;

import com.authoring.tool.dto.AtlSlidesWithoutCourseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.authoring.tool.dto.AtlSlidesDto;
import com.authoring.tool.dto.AtlSlidesWithComponentDto;
import com.authoring.tool.services.AtlSlidesService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("slide")
@RequiredArgsConstructor
public class AtlSlidesController {
	private final AtlSlidesService slideService;
	
	@PostMapping
	public ResponseEntity<AtlSlidesDto> saveSlides(@RequestBody AtlSlidesDto slideDto){
		return new ResponseEntity<AtlSlidesDto>(slideService.saveSlide(slideDto), HttpStatus.CREATED);
	}
	
	@GetMapping
	public ResponseEntity<AtlSlidesWithComponentDto> getSlideById(@RequestParam Long slideId){
		return new ResponseEntity<AtlSlidesWithComponentDto>(slideService.getSlideById(slideId), HttpStatus.OK);
	}

    @PutMapping
    public ResponseEntity<AtlSlidesWithoutCourseDto> updateSlideById(@RequestBody AtlSlidesDto updatedSlideDto){
        return new ResponseEntity<AtlSlidesWithoutCourseDto>(slideService.updateSlideData(updatedSlideDto), HttpStatus.OK);
    }
}
