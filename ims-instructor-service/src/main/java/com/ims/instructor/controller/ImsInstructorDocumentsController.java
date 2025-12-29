package com.ims.instructor.controller;

import com.ims.instructor.dto.ImsInstructorDocumentsDto;
import com.ims.instructor.service.ImsInstructorDocumentsService;
import com.ims.instructor.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/instructor-documents")
@RequiredArgsConstructor
public class ImsInstructorDocumentsController {

    private final ImsInstructorDocumentsService service;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ImsInstructorDocumentsDto>> upload(
            @RequestParam String instructorId,
            @RequestParam String documentType,
            @RequestParam MultipartFile file
    ) {
        ImsInstructorDocumentsDto dto = service.uploadDocument(instructorId, documentType, file);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsInstructorDocumentsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Document uploaded successfully")
                        .apiData(dto)
                        .build()
        );
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<ApiResponse<List<ImsInstructorDocumentsDto>>> getByInstructor(@PathVariable String instructorId) {
        return ResponseEntity.ok(
                ApiResponse.<List<ImsInstructorDocumentsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(200)
                        .message("Documents fetched successfully")
                        .apiData(service.getByInstructor(instructorId))
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsInstructorDocumentsDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsInstructorDocumentsDto>builder()
                        .status("SUCCESS")
                        .statusCode(200)
                        .message("Document fetched")
                        .apiData(service.getById(id))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        service.delete(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(200)
                        .message("Document deleted")
                        .apiData(null)
                        .build()
        );
    }
}
