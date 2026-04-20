package com.ims.academic.controller;

import com.ims.academic.dto.ImsAssignmentsDto;
import com.ims.academic.service.ImsAssignmentsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("assignments")
@RequiredArgsConstructor
public class ImsAssignmentsController {

    private final ImsAssignmentsService service;

    @GetMapping("/student/{studentId}/summary")
    public ResponseEntity<com.ims.academic.util.ApiResponse<com.ims.academic.dto.StudentAssignmentSummaryDto>> getStudentSummary(
            @PathVariable String studentId,
            @RequestParam String offeringId,
            @RequestParam String tenantId) {
        return ResponseEntity.ok(
                com.ims.academic.util.ApiResponse.<com.ims.academic.dto.StudentAssignmentSummaryDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Assignment summary fetched successfully")
                        .apiData(service.getStudentSummary(offeringId, studentId, tenantId))
                        .build());
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ImsAssignmentsDto>> create(@RequestBody ImsAssignmentsDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsAssignmentsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Assignment created successfully")
                        .apiData(service.create(dto))
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsAssignmentsDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsAssignmentsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Assignment fetched successfully")
                        .apiData(service.getById(id))
                        .build());
    }

    @GetMapping("/offering/{offeringId}")
    public ResponseEntity<ApiResponse<List<ImsAssignmentsDto>>> getByOfferingId(
            @PathVariable String offeringId) {

        return ResponseEntity.ok(
                ApiResponse.<List<ImsAssignmentsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Assignments fetched successfully")
                        .apiData(service.getByOfferingId(offeringId))
                        .build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsAssignmentsDto>> update(
            @PathVariable String id, @RequestBody ImsAssignmentsDto dto) {
        return ResponseEntity.ok(
                ApiResponse.<ImsAssignmentsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Assignment updated successfully")
                        .apiData(service.update(id, dto))
                        .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {

        service.delete(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Assignment deleted successfully")
                        .apiData(null)
                        .build());
    }
}
