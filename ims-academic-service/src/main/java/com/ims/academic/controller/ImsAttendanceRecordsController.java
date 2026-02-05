package com.ims.academic.controller;

import com.ims.academic.dto.AttendanceSummaryDto;
import com.ims.academic.dto.ImsAttendanceRecordsDto;
import com.ims.academic.service.ImsAttendanceRecordsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("attendance-records")
@RequiredArgsConstructor
public class ImsAttendanceRecordsController {

        private final ImsAttendanceRecordsService service;

        @PostMapping
        @PreAuthorize("@securityService.canMarkAttendance(#dto.instructorId)")
        public ResponseEntity<ApiResponse<ImsAttendanceRecordsDto>> create(@RequestBody ImsAttendanceRecordsDto dto) {
                return ResponseEntity.status(HttpStatus.CREATED).body(
                                ApiResponse.<ImsAttendanceRecordsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.CREATED.value())
                                                .message("Attendance Record created successfully")
                                                .apiData(service.create(dto))
                                                .build());
        }

        @GetMapping("/{id}")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<ApiResponse<ImsAttendanceRecordsDto>> getById(@PathVariable String id) {
                return ResponseEntity.ok(
                                ApiResponse.<ImsAttendanceRecordsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Attendance Record fetched successfully")
                                                .apiData(service.getById(id))
                                                .build());
        }

        @GetMapping("/master/{attendanceMasterId}")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<ApiResponse<List<ImsAttendanceRecordsDto>>> getByAttendanceMasterId(
                        @PathVariable String attendanceMasterId) {

                return ResponseEntity.ok(
                                ApiResponse.<List<ImsAttendanceRecordsDto>>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Attendance Records fetched successfully")
                                                .apiData(service.getByAttendanceMasterId(attendanceMasterId))
                                                .build());
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("@securityService.canManageAcademics()")
        public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {

                service.delete(id);

                return ResponseEntity.ok(
                                ApiResponse.<Void>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Attendance Record deleted successfully")
                                                .apiData(null)
                                                .build());
        }

        @GetMapping("/student/{studentId}/summary")
        @PreAuthorize("@securityService.canViewStudentAttendance(#studentId)")
        public ResponseEntity<ApiResponse<AttendanceSummaryDto>> getSummaryByStudentId(@PathVariable String studentId) {
                return ResponseEntity.ok(
                                ApiResponse.<AttendanceSummaryDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Attendance Summary fetched successfully")
                                                .apiData(service.getSummaryByStudentId(studentId))
                                                .build());
        }
}
