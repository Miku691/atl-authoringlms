package com.authoring.tool.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @PutMapping
    public ResponseEntity<AtlComponentTextDto> updateTextData(@RequestBody AtlComponentTextDto textUpdateDto){
        return new ResponseEntity<AtlComponentTextDto>(textService.updateTextData(textUpdateDto), HttpStatus.OK);
    }
}
