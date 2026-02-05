package com.ims.academic.controller;

import com.ims.academic.dto.SyllabusCoverageDto;
import com.ims.academic.service.impl.SyllabusTrackingServiceImpl;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/syllabus/coverage")
@RequiredArgsConstructor
public class SyllabusController {

    private final SyllabusTrackingServiceImpl service;

    @PutMapping
    public ResponseEntity<ApiResponse<SyllabusCoverageDto>> updateCoverage(@RequestBody SyllabusCoverageDto dto) {
        return ResponseEntity
                .ok(ApiResponse.success(HttpStatus.OK.value(), "Coverage updated", service.updateCoverage(dto)));
    }

    @GetMapping("/{offeringSubjectId}")
    public ResponseEntity<ApiResponse<List<SyllabusCoverageDto>>> getCoverage(@PathVariable String offeringSubjectId) {
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Syllabus coverage",
                service.getCoverage(offeringSubjectId)));
    }
}
