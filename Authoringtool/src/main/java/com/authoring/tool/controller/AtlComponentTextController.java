package com.authoring.tool.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.authoring.tool.dto.AtlComponentTextDto;
import com.authoring.tool.services.AtlComponentTextService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("text")
@RequiredArgsConstructor
public class AtlComponentTextController {
	private final AtlComponentTextService  textService;
	
	@PostMapping
	public ResponseEntity<AtlComponentTextDto> saveTextData(@RequestBody AtlComponentTextDto textDto){
		return new ResponseEntity<AtlComponentTextDto>(textService.saveTextData(textDto), HttpStatus.CREATED);
	}
	
	@GetMapping
	public ResponseEntity<AtlComponentTextDto> getTextData(@RequestParam Long textId){
		return new ResponseEntity<AtlComponentTextDto>(textService.getTextData(textId), HttpStatus.OK);
	}
}
