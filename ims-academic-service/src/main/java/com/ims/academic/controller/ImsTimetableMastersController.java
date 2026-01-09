package com.ims.academic.controller;

import com.ims.academic.dto.ImsTimetableMastersDto;
import com.ims.academic.service.ImsTimetableMastersService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("timetable-masters")
@RequiredArgsConstructor
public class ImsTimetableMastersController {

    private final ImsTimetableMastersService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsTimetableMastersDto>> create(@RequestBody ImsTimetableMastersDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsTimetableMastersDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Timetable Master created successfully")
                        .apiData(service.create(dto))
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsTimetableMastersDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsTimetableMastersDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Timetable Master fetched successfully")
                        .apiData(service.getById(id))
                        .build());
    }

    @GetMapping("/offering/{offeringId}")
    public ResponseEntity<ApiResponse<List<ImsTimetableMastersDto>>> getByOfferingId(
            @PathVariable String offeringId) {

        return ResponseEntity.ok(
                ApiResponse.<List<ImsTimetableMastersDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Timetable Masters fetched successfully")
                        .apiData(service.getByOfferingId(offeringId))
                        .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {

        service.delete(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Timetable Master deleted successfully")
                        .apiData(null)
                        .build());
    }
}
