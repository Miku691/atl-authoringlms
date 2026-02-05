package com.ims.student.controller;

import com.ims.student.dto.ImsStudentsDto;
import com.ims.student.service.ImsStudentsService;
import com.ims.student.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("students")
@RequiredArgsConstructor
public class ImsStudentsController {

        private final ImsStudentsService service;

        @PostMapping
        @PreAuthorize("@securityService.canManageStudent()")
        public ResponseEntity<ApiResponse<ImsStudentsDto>> create(@RequestBody ImsStudentsDto dto) {
                ImsStudentsDto saved = service.create(dto);
                return ResponseEntity.status(HttpStatus.CREATED).body(
                                ApiResponse.<ImsStudentsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.CREATED.value())
                                                .message("Student created successfully")
                                                .apiData(saved)
                                                .build());
        }

        @PutMapping("/{id}")
        @PreAuthorize("@securityService.canManageStudent()")
        public ResponseEntity<ApiResponse<ImsStudentsDto>> update(@PathVariable String id,
                        @RequestBody ImsStudentsDto dto) {
                ImsStudentsDto updated = service.update(id, dto);
                return ResponseEntity.ok(
                                ApiResponse.<ImsStudentsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Student updated successfully")
                                                .apiData(updated)
                                                .build());
        }

        @GetMapping("/{id}")
        @PreAuthorize("@securityService.canViewStudent(#id)")
        public ResponseEntity<ApiResponse<ImsStudentsDto>> getById(@PathVariable String id) {
                ImsStudentsDto dto = service.getById(id);
                return ResponseEntity.ok(
                                ApiResponse.<ImsStudentsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Student fetched successfully")
                                                .apiData(dto)
                                                .build());
        }

        @GetMapping("/tenant/{tenantId}")
        @PreAuthorize("@securityService.canManageStudent() or hasRole('TEACHER')")
        public ResponseEntity<ApiResponse<List<ImsStudentsDto>>> getByTenant(@PathVariable String tenantId) {
                List<ImsStudentsDto> list = service.getByTenant(tenantId);
                return ResponseEntity.ok(
                                ApiResponse.<List<ImsStudentsDto>>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Students fetched successfully")
                                                .apiData(list)
                                                .build());
        }

        @GetMapping
        @PreAuthorize("@securityService.canManageStudent()")
        public ResponseEntity<ApiResponse<List<ImsStudentsDto>>> getAll() {
                List<ImsStudentsDto> list = service.getAll();
                return ResponseEntity.ok(
                                ApiResponse.<List<ImsStudentsDto>>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Students fetched successfully")
                                                .apiData(list)
                                                .build());
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("@securityService.canManageStudent()")
        public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
                service.delete(id);
                return ResponseEntity.ok(
                                ApiResponse.<Void>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Student deactivated successfully")
                                                .apiData(null)
                                                .build());
        }

        @GetMapping("/user/{userId}")
        public ResponseEntity<ApiResponse<ImsStudentsDto>> getByUserId(@PathVariable String userId) {
                ImsStudentsDto dto = service.getStudentByUserId(userId);
                return ResponseEntity.ok(
                                ApiResponse.<ImsStudentsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Student fetched successfully")
                                                .apiData(dto)
                                                .build());
        }

        @GetMapping("/count/tenant/{tenantId}")
        public ResponseEntity<ApiResponse<Long>> countByTenant(@PathVariable String tenantId) {
                long count = service.countByTenant(tenantId);
                return ResponseEntity.ok(
                                ApiResponse.<Long>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Student count fetched successfully")
                                                .apiData(count)
                                                .build());
        }

        @GetMapping("/profile/resolve")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<ApiResponse<ImsStudentsDto>> resolveProfile(
                        @RequestParam String email,
                        @RequestParam String tenantId) {
                ImsStudentsDto dto = service.getStudentByEmailAndTenantId(email, tenantId);
                return ResponseEntity.ok(
                                ApiResponse.<ImsStudentsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Student profile resolved successfully")
                                                .apiData(dto)
                                                .build());
        }
}
