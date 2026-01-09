package com.ims.academic.controller;

import com.ims.academic.dto.ImsAttendanceRecordsDto;
import com.ims.academic.service.ImsAttendanceRecordsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("attendance-records")
@RequiredArgsConstructor
public class ImsAttendanceRecordsController {

    private final ImsAttendanceRecordsService service;

    @PostMapping
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
}
