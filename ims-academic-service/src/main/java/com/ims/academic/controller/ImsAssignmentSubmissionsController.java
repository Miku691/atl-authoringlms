package com.ims.academic.controller;

import com.ims.academic.dto.ImsAssignmentSubmissionsDto;
import com.ims.academic.service.ImsAssignmentSubmissionsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("assignment-submissions")
@RequiredArgsConstructor
public class ImsAssignmentSubmissionsController {

    private final ImsAssignmentSubmissionsService service;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ImsAssignmentSubmissionsDto>> submitAssignment(
            @RequestParam("assignmentId") String assignmentId,
            @RequestParam("studentId") String studentId,
            @RequestPart(value = "file", required = false) MultipartFile file) {

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsAssignmentSubmissionsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Assignment submitted successfully")
                        .apiData(service.submitAssignment(assignmentId, studentId, file))
                        .build());
    }

    @PutMapping("/{id}/grade")
    public ResponseEntity<ApiResponse<ImsAssignmentSubmissionsDto>> gradeSubmission(
            @PathVariable String id,
            @RequestBody ImsAssignmentSubmissionsDto dto) {

        return ResponseEntity.ok(
                ApiResponse.<ImsAssignmentSubmissionsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Submission graded successfully")
                        .apiData(service.gradeSubmission(id, dto))
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsAssignmentSubmissionsDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsAssignmentSubmissionsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Submission fetched successfully")
                        .apiData(service.getById(id))
                        .build());
    }

    @GetMapping("/assignment/{assignmentId}")
    public ResponseEntity<ApiResponse<List<ImsAssignmentSubmissionsDto>>> getByAssignmentId(
            @PathVariable String assignmentId) {

        return ResponseEntity.ok(
                ApiResponse.<List<ImsAssignmentSubmissionsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Submissions fetched successfully")
                        .apiData(service.getByAssignmentId(assignmentId))
                        .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {

        service.delete(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Submission deleted successfully")
                        .apiData(null)
                        .build());
    }
}
