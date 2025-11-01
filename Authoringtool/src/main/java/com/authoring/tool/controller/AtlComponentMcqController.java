package com.authoring.tool.controller;

import com.authoring.tool.dto.AtlComponentMcqDto;
import com.authoring.tool.services.AtlComponentMcqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("mcq")
@RequiredArgsConstructor
public class AtlComponentMcqController {
    private final AtlComponentMcqService mcqService;

    @PostMapping
    public ResponseEntity<AtlComponentMcqDto> saveMcqId(@RequestBody AtlComponentMcqDto mcqDto){
        return new ResponseEntity<AtlComponentMcqDto>(mcqService.saveMcqId(mcqDto), HttpStatus.CREATED);
    }

    public ResponseEntity<AtlComponentMcqDto> getMcqData(@RequestParam Long id){
        return new ResponseEntity<AtlComponentMcqDto>(mcqService.getMcqData(id), HttpStatus.OK);
    }
}
