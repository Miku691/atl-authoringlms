package com.authoring.tool.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.authoring.tool.dto.AtlComponentTrackingDto;
import com.authoring.tool.services.AtlComponentTrackingService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/comp-tracking")
@RequiredArgsConstructor
public class AtlComponentTrackingController {
	private final AtlComponentTrackingService trackingService;
	
	@PostMapping
	public ResponseEntity<AtlComponentTrackingDto> saveTrackingData(@RequestBody AtlComponentTrackingDto dto){
		return new ResponseEntity<AtlComponentTrackingDto>(trackingService.saveComponentTracking(dto), HttpStatus.CREATED);
	}
	
	@GetMapping
	public ResponseEntity<AtlComponentTrackingDto> getTrackingData(@RequestParam Long id){
		return new ResponseEntity<AtlComponentTrackingDto>(trackingService.getComponentTracking(id), HttpStatus.OK);
	}
}
