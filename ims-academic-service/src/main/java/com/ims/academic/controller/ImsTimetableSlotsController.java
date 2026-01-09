package com.ims.academic.controller;

import com.ims.academic.dto.ImsTimetableSlotsDto;
import com.ims.academic.service.ImsTimetableSlotsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("timetable-slots")
@RequiredArgsConstructor
public class ImsTimetableSlotsController {

    private final ImsTimetableSlotsService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsTimetableSlotsDto>> create(@RequestBody ImsTimetableSlotsDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsTimetableSlotsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Timetable Slot created successfully")
                        .apiData(service.create(dto))
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsTimetableSlotsDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsTimetableSlotsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Timetable Slot fetched successfully")
                        .apiData(service.getById(id))
                        .build());
    }

    @GetMapping("/master/{timetableMasterId}")
    public ResponseEntity<ApiResponse<List<ImsTimetableSlotsDto>>> getByTimetableMasterId(
            @PathVariable String timetableMasterId) {

        return ResponseEntity.ok(
                ApiResponse.<List<ImsTimetableSlotsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Timetable Slots fetched successfully")
                        .apiData(service.getByTimetableMasterId(timetableMasterId))
                        .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {

        service.delete(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Timetable Slot deleted successfully")
                        .apiData(null)
                        .build());
    }
}
