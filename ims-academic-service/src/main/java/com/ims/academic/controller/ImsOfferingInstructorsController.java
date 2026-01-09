package com.ims.academic.controller;

import com.ims.academic.dto.ImsOfferingInstructorsDto;
import com.ims.academic.service.ImsOfferingInstructorsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("offering-instructors")
@RequiredArgsConstructor
public class ImsOfferingInstructorsController {

    private final ImsOfferingInstructorsService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsOfferingInstructorsDto>> create(@RequestBody ImsOfferingInstructorsDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsOfferingInstructorsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Offering Instructor assigned successfully")
                        .apiData(service.create(dto))
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsOfferingInstructorsDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsOfferingInstructorsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Offering Instructor fetched successfully")
                        .apiData(service.getById(id))
                        .build());
    }

    @GetMapping("/offering/{offeringId}")
    public ResponseEntity<ApiResponse<List<ImsOfferingInstructorsDto>>> getByOfferingId(
            @PathVariable String offeringId) {

        return ResponseEntity.ok(
                ApiResponse.<List<ImsOfferingInstructorsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Offering Instructors fetched successfully")
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
                        .message("Offering Instructor removed successfully")
                        .apiData(null)
                        .build());
    }
}
