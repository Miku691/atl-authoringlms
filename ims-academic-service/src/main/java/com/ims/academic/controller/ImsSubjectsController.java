package com.ims.academic.controller;

import com.ims.academic.dto.MessageDto;
import com.ims.academic.dto.SubjectRequestDto;
import com.ims.academic.dto.SubjectResponseDto;
import com.ims.academic.service.ImsSubjectsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subjects")
@RequiredArgsConstructor
public class ImsSubjectsController {

    private final ImsSubjectsService subjectsService;

    @PostMapping("/tenant/{tenantId}")
    public ResponseEntity<MessageDto> createSubject(
            @PathVariable String tenantId,
            @RequestBody SubjectRequestDto dto) {
        return ResponseEntity.ok(subjectsService.createSubject(tenantId, dto));
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<List<SubjectResponseDto>> getAllSubjects(@PathVariable String tenantId) {
        return ResponseEntity.ok(subjectsService.getAllSubjects(tenantId));
    }

    @DeleteMapping("/tenant/{tenantId}/subject/{subjectId}")
    public ResponseEntity<MessageDto> deleteSubject(
            @PathVariable String tenantId,
            @PathVariable String subjectId) {
        return ResponseEntity.ok(subjectsService.deleteSubject(tenantId, subjectId));
    }
}
