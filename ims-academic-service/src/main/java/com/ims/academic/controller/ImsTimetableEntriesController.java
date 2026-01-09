package com.ims.academic.controller;

import com.ims.academic.dto.ImsTimetableEntriesDto;
import com.ims.academic.service.ImsTimetableEntriesService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("timetable-entries")
@RequiredArgsConstructor
public class ImsTimetableEntriesController {

    private final ImsTimetableEntriesService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsTimetableEntriesDto>> create(@RequestBody ImsTimetableEntriesDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsTimetableEntriesDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Timetable Entry created successfully")
                        .apiData(service.create(dto))
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsTimetableEntriesDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsTimetableEntriesDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Timetable Entry fetched successfully")
                        .apiData(service.getById(id))
                        .build());
    }

    @GetMapping("/slot/{timetableSlotId}")
    public ResponseEntity<ApiResponse<List<ImsTimetableEntriesDto>>> getByTimetableSlotId(
            @PathVariable String timetableSlotId) {

        return ResponseEntity.ok(
                ApiResponse.<List<ImsTimetableEntriesDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Timetable Entries fetched successfully")
                        .apiData(service.getByTimetableSlotId(timetableSlotId))
                        .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {

        service.delete(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Timetable Entry deleted successfully")
                        .apiData(null)
                        .build());
    }
}
