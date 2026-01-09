package com.ims.academic.controller;

import com.ims.academic.dto.ImsAttendanceMasterDto;
import com.ims.academic.service.ImsAttendanceMasterService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("attendance-master")
@RequiredArgsConstructor
public class ImsAttendanceMasterController {

    private final ImsAttendanceMasterService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsAttendanceMasterDto>> create(@RequestBody ImsAttendanceMasterDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsAttendanceMasterDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Attendance Master created successfully")
                        .apiData(service.create(dto))
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsAttendanceMasterDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsAttendanceMasterDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Attendance Master fetched successfully")
                        .apiData(service.getById(id))
                        .build());
    }

    @GetMapping("/offering/{offeringId}")
    public ResponseEntity<ApiResponse<List<ImsAttendanceMasterDto>>> getByOfferingId(
            @PathVariable String offeringId) {

        return ResponseEntity.ok(
                ApiResponse.<List<ImsAttendanceMasterDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Attendance Masters fetched successfully")
                        .apiData(service.getByOfferingId(offeringId))
                        .build());
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ImsAttendanceMasterDto>>> getByOfferingIdAndDate(
            @RequestParam String offeringId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        return ResponseEntity.ok(
                ApiResponse.<List<ImsAttendanceMasterDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Attendance Masters fetched successfully")
                        .apiData(service.getByOfferingIdAndDate(offeringId, date))
                        .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {

        service.delete(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Attendance Master deleted successfully")
                        .apiData(null)
                        .build());
    }
}
