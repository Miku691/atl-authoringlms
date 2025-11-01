package com.authoring.tool.controller;


import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PutMapping
    public ResponseEntity<AtlComponentHeadingDto> updateHeadingData(@RequestBody AtlComponentHeadingDto headingUpdate){
        return new ResponseEntity<AtlComponentHeadingDto>(headingService.updateHeadingData(headingUpdate), HttpStatus.OK);
    }
}
