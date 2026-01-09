package com.ims.student.controller;

import com.ims.student.dto.ImsStudentEnrollmentsDto;
import com.ims.student.service.ImsStudentEnrollmentsService;
import com.ims.student.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/student-enrollments")
@RequiredArgsConstructor
public class ImsStudentEnrollmentsController {

        private final ImsStudentEnrollmentsService service;

        @PostMapping
        public ResponseEntity<ApiResponse<ImsStudentEnrollmentsDto>> create(@RequestBody ImsStudentEnrollmentsDto dto) {
                ImsStudentEnrollmentsDto saved = service.create(dto);
                return ResponseEntity.status(HttpStatus.CREATED).body(
                                ApiResponse.<ImsStudentEnrollmentsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.CREATED.value())
                                                .message("Enrollment created successfully")
                                                .apiData(saved)
                                                .build());
        }

        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<ImsStudentEnrollmentsDto>> update(
                        @PathVariable String id,
                        @RequestBody ImsStudentEnrollmentsDto dto) {

                ImsStudentEnrollmentsDto updated = service.update(id, dto);
                return ResponseEntity.ok(
                                ApiResponse.<ImsStudentEnrollmentsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Enrollment updated successfully")
                                                .apiData(updated)
                                                .build());
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<ImsStudentEnrollmentsDto>> getById(@PathVariable String id) {
                ImsStudentEnrollmentsDto dto = service.getById(id);
                return ResponseEntity.ok(
                                ApiResponse.<ImsStudentEnrollmentsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Enrollment fetched successfully")
                                                .apiData(dto)
                                                .build());
        }

        @GetMapping("/student/{studentId}")
        public ResponseEntity<ApiResponse<List<ImsStudentEnrollmentsDto>>> getByStudentId(
                        @PathVariable String studentId) {
                List<ImsStudentEnrollmentsDto> list = service.getByStudentId(studentId);
                return ResponseEntity.ok(
                                ApiResponse.<List<ImsStudentEnrollmentsDto>>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Enrollments fetched for student ID: " + studentId)
                                                .apiData(list)
                                                .build());
        }

        @GetMapping
        public ResponseEntity<ApiResponse<List<ImsStudentEnrollmentsDto>>> getAll() {
                List<ImsStudentEnrollmentsDto> list = service.getAll();
                return ResponseEntity.ok(
                                ApiResponse.<List<ImsStudentEnrollmentsDto>>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("All enrollments fetched successfully")
                                                .apiData(list)
                                                .build());
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
                service.delete(id);
                return ResponseEntity.ok(
                                ApiResponse.<Void>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Enrollment withdrawn successfully")
                                                .apiData(null)
                                                .build());
        }

        @GetMapping("/offering/{offeringId}")
        public ResponseEntity<ApiResponse<Page<com.ims.student.dto.StudentSummaryDto>>> getStudentsByOffering(
                        @PathVariable String offeringId,
                        @RequestParam(required = false, defaultValue = "ACTIVE") String status,
                        @RequestParam(defaultValue = "0") int page,
                        @RequestParam(defaultValue = "10") int size) {

                Pageable pageable = PageRequest.of(page, size);

                return ResponseEntity.ok(
                                ApiResponse.<Page<com.ims.student.dto.StudentSummaryDto>>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Students fetched successfully")
                                                .apiData(service.getStudentsByOffering(offeringId, status, pageable))
                                                .build());
        }

        @GetMapping("/history/{studentId}")
        public ResponseEntity<ApiResponse<java.util.List<com.ims.student.dto.StudentAcademicHistoryDto>>> getAcademicHistory(
                        @PathVariable String studentId) {

                return ResponseEntity.ok(
                                ApiResponse.<java.util.List<com.ims.student.dto.StudentAcademicHistoryDto>>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Academic history fetched successfully")
                                                .apiData(service.getAcademicHistory(studentId))
                                                .build());
        }
}