package com.ims.academic.controller;

import com.ims.academic.dto.ImsChaptersDto;
import com.ims.academic.service.ImsChaptersService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("chapters")
@RequiredArgsConstructor
public class ImsChaptersController {

        private final ImsChaptersService service;

        @PostMapping
        public ResponseEntity<ApiResponse<ImsChaptersDto>> create(@RequestBody ImsChaptersDto dto) {
                return ResponseEntity.status(HttpStatus.CREATED).body(
                                ApiResponse.<ImsChaptersDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.CREATED.value())
                                                .message("Chapter created successfully")
                                                .apiData(service.create(dto))
                                                .build());
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<ImsChaptersDto>> getById(@PathVariable String id) {
                return ResponseEntity.ok(
                                ApiResponse.<ImsChaptersDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Chapter fetched successfully")
                                                .apiData(service.getById(id))
                                                .build());
        }

        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<ImsChaptersDto>> update(@PathVariable String id,
                        @RequestBody ImsChaptersDto dto) {
                return ResponseEntity.ok(
                                ApiResponse.<ImsChaptersDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Chapter updated successfully")
                                                .apiData(service.update(id, dto))
                                                .build());
        }

        @GetMapping("/offering-subject/{offeringSubjectId}")
        public ResponseEntity<ApiResponse<List<ImsChaptersDto>>> getByOfferingSubjectId(
                        @PathVariable String offeringSubjectId) {

                return ResponseEntity.ok(
                                ApiResponse.<List<ImsChaptersDto>>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Chapters fetched successfully")
                                                .apiData(service.getByOfferingSubjectId(offeringSubjectId))
                                                .build());
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {

                service.delete(id);

                return ResponseEntity.ok(
                                ApiResponse.<Void>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Chapter deleted successfully")
                                                .apiData(null)
                                                .build());
        }
}
