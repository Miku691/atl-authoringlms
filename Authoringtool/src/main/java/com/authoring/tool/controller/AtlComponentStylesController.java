package com.authoring.tool.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.authoring.tool.dto.AtlComponentStylesDto;
import com.authoring.tool.services.AtlComponentStylesService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("json-style")
@RequiredArgsConstructor
public class AtlComponentStylesController {
	private final AtlComponentStylesService styleService;
	
	@PostMapping
	public ResponseEntity<AtlComponentStylesDto> saveStyleData(@RequestBody AtlComponentStylesDto styleDto){
		return new ResponseEntity<AtlComponentStylesDto>(styleService.saveStyleJson(styleDto), HttpStatus.CREATED);
	}
	
	@GetMapping
	public ResponseEntity<AtlComponentStylesDto> getStyleData(@RequestParam("id") Long id){
		return new ResponseEntity<AtlComponentStylesDto>(styleService.getStyleJson(id), HttpStatus.OK);
	}
}
