package com.authoring.tool.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.authoring.tool.dto.AtlComponentHeadingDto;
import com.authoring.tool.dto.AtlHeadingWOSlideDto;
import com.authoring.tool.services.AtlComponentHeadingService;


import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("heading")
@RequiredArgsConstructor
public class AtlComponentHeadingController {
	private final AtlComponentHeadingService headingService;
	
	@PostMapping
	public ResponseEntity<AtlComponentHeadingDto> saveHeadingData(@RequestBody AtlComponentHeadingDto atlHeading){
		return new ResponseEntity<AtlComponentHeadingDto>(headingService.saveComponentHeading(atlHeading), HttpStatus.CREATED);
	}
	
	@GetMapping
	public  ResponseEntity<AtlHeadingWOSlideDto> getHeadingData(@RequestParam Long headingId){
		return new ResponseEntity<AtlHeadingWOSlideDto>(headingService.getComponentHeading(headingId), HttpStatus.OK);
	}
}
