package com.authoring.tool.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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
}
