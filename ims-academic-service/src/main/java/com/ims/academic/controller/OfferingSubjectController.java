package com.ims.academic.controller;

import com.ims.academic.dto.OfferingSubjectDto;
import com.ims.academic.service.impl.OfferingSubjectServiceImpl; // Direct impl usage for speed, refactor to interface later
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/offering-subject")
@RequiredArgsConstructor
public class OfferingSubjectController {

    private final OfferingSubjectServiceImpl service;

    @PostMapping
    public ResponseEntity<ApiResponse<OfferingSubjectDto>> addSubject(@RequestBody OfferingSubjectDto dto) {
        return new ResponseEntity<>(
                ApiResponse.success(HttpStatus.CREATED.value(), "Subject added to offering",
                        service.addSubjectToOffering(dto)),
                HttpStatus.CREATED);
    }

    @GetMapping("/{offeringId}")
    public ResponseEntity<ApiResponse<List<OfferingSubjectDto>>> getSubjects(@PathVariable String offeringId) {
        return ResponseEntity
                .ok(ApiResponse.success(HttpStatus.OK.value(), "Offering subjects", service.getByOffering(offeringId)));
    }

    @DeleteMapping("/{subjectMappingId}")
    public ResponseEntity<ApiResponse<Void>> removeSubject(@PathVariable String subjectMappingId) {
        service.removeSubjectFromOffering(subjectMappingId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Subject removed from offering", null));
    }
}
