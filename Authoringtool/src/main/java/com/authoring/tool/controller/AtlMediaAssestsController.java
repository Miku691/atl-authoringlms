package com.authoring.tool.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.authoring.tool.dto.AtlMediaAssestsDto;
import com.authoring.tool.services.AtlMediaAssestsService;

@RestController
@RequestMapping("media-asset")
public class AtlMediaAssestsController {
	@Autowired
	private AtlMediaAssestsService mediaService;
	@PostMapping
	public ResponseEntity<AtlMediaAssestsDto> saveData(
			@RequestBody AtlMediaAssestsDto mediaAssetDto){
		return new ResponseEntity<AtlMediaAssestsDto>(mediaService.saveMediaAssest(mediaAssetDto), HttpStatus.CREATED);
	}
	
	@GetMapping
	public ResponseEntity<AtlMediaAssestsDto> getMediaAssetData(@RequestParam Long id){
		return new ResponseEntity<AtlMediaAssestsDto>(mediaService.fetchMediaAssest(id), HttpStatus.OK);
	}
}
