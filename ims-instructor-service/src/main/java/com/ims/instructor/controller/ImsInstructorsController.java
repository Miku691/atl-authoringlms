package com.ims.instructor.controller;

import com.ims.instructor.dto.ImsInstructorsDto;
import com.ims.instructor.service.ImsInstructorsService;
import com.ims.instructor.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

@RestController
@RequestMapping("instructors")
@RequiredArgsConstructor
public class ImsInstructorsController {

        private final ImsInstructorsService service;

        @PostMapping
        public ResponseEntity<ApiResponse<ImsInstructorsDto>> create(@RequestBody ImsInstructorsDto dto) {
                ImsInstructorsDto saved = service.create(dto);
                return ResponseEntity.status(HttpStatus.CREATED).body(
                                ApiResponse.<ImsInstructorsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.CREATED.value())
                                                .message("Instructor created successfully")
                                                .apiData(saved)
                                                .build());
        }

        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<ImsInstructorsDto>> update(
                        @PathVariable String id,
                        @RequestBody ImsInstructorsDto dto) {

                ImsInstructorsDto updated = service.update(id, dto);
                return ResponseEntity.ok(
                                ApiResponse.<ImsInstructorsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Instructor updated successfully")
                                                .apiData(updated)
                                                .build());
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<ImsInstructorsDto>> getById(@PathVariable String id) {
                ImsInstructorsDto dto = service.getById(id);
                return ResponseEntity.ok(
                                ApiResponse.<ImsInstructorsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Instructor fetched successfully")
                                                .apiData(dto)
                                                .build());
        }

        @GetMapping("/user/{userId}")
        public ResponseEntity<ApiResponse<ImsInstructorsDto>> getByUserId(@PathVariable String userId) {
                ImsInstructorsDto dto = service.getByUserId(userId);
                return ResponseEntity.ok(
                                ApiResponse.<ImsInstructorsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Instructor fetched successfully")
                                                .apiData(dto)
                                                .build());
        }

        @GetMapping("/tenant/{tenantId}")
        public ResponseEntity<ApiResponse<Page<ImsInstructorsDto>>> getByTenant(
                        @PathVariable String tenantId,
                        Pageable pageable) {
                Page<ImsInstructorsDto> page = service.getByTenant(tenantId, pageable);
                return ResponseEntity.ok(
                                ApiResponse.<Page<ImsInstructorsDto>>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Instructors fetched successfully")
                                                .apiData(page)
                                                .build());
        }

        @GetMapping
        public ResponseEntity<ApiResponse<Page<ImsInstructorsDto>>> getAll(Pageable pageable) {
                Page<ImsInstructorsDto> page = service.getAll(pageable);
                return ResponseEntity.ok(
                                ApiResponse.<Page<ImsInstructorsDto>>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("All instructors fetched")
                                                .apiData(page)
                                                .build());
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
                service.delete(id);
                return ResponseEntity.ok(
                                ApiResponse.<Void>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Instructor deleted successfully")
                                                .apiData(null)
                                                .build());
        }

        @GetMapping("/count/tenant/{tenantId}")
        public ResponseEntity<ApiResponse<Long>> countByTenant(@PathVariable String tenantId) {
                long count = service.countByTenant(tenantId);
                return ResponseEntity.ok(
                                ApiResponse.<Long>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Instructor count fetched successfully")
                                                .apiData(count)
                                                .build());
        }

        @GetMapping("/profile/resolve")
        public ResponseEntity<ApiResponse<ImsInstructorsDto>> resolveProfile(
                        @RequestParam String email,
                        @RequestParam String tenantId) {
                ImsInstructorsDto dto = service.getByEmailAndTenantId(email, tenantId);
                return ResponseEntity.ok(
                                ApiResponse.<ImsInstructorsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Instructor profile resolved successfully")
                                                .apiData(dto)
                                                .build());
        }

        @PostMapping("/{id}/grant-access")
        public ResponseEntity<ApiResponse<Void>> grantAccess(@PathVariable String id) {
                service.grantAccess(id);
                return ResponseEntity.ok(
                                ApiResponse.<Void>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Access granted successfully")
                                                .apiData(null)
                                                .build());
        }

        @GetMapping("/birthdays/today/tenant/{tenantId}")
        public ResponseEntity<ApiResponse<Long>> getTodayBirthdaysCount(@PathVariable String tenantId) {
                return ResponseEntity.ok(
                                ApiResponse.<Long>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Today's birthday count fetched successfully")
                                                .apiData(service.getTodayBirthdaysCount(tenantId))
                                                .build());
        }
}

