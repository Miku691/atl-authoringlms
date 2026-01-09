package com.ims.academic.controller;

import com.ims.academic.dto.ImsInstructorClassMappingsDto;
import com.ims.academic.service.ImsInstructorClassMappingsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("instructor-class-mappings")
@RequiredArgsConstructor
public class ImsInstructorClassMappingsController {

    private final ImsInstructorClassMappingsService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsInstructorClassMappingsDto>> create(
            @RequestBody ImsInstructorClassMappingsDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsInstructorClassMappingsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Mapping created successfully")
                        .apiData(service.create(dto))
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsInstructorClassMappingsDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsInstructorClassMappingsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Mapping fetched successfully")
                        .apiData(service.getById(id))
                        .build());
    }

    @GetMapping("/instructor/{instructorId}")
    public ResponseEntity<ApiResponse<List<ImsInstructorClassMappingsDto>>> getByInstructorId(
            @PathVariable String instructorId) {

        return ResponseEntity.ok(
                ApiResponse.<List<ImsInstructorClassMappingsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Mappings fetched successfully")
                        .apiData(service.getByInstructorId(instructorId))
                        .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {

        service.delete(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Mapping deleted successfully")
                        .apiData(null)
                        .build());
    }
}
