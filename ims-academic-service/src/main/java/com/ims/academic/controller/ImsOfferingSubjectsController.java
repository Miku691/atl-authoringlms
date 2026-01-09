package com.ims.academic.controller;

import com.ims.academic.dto.ImsOfferingSubjectsDto;
import com.ims.academic.service.ImsOfferingSubjectsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("offering-subjects")
@RequiredArgsConstructor
public class ImsOfferingSubjectsController {

    private final ImsOfferingSubjectsService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsOfferingSubjectsDto>> create(@RequestBody ImsOfferingSubjectsDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsOfferingSubjectsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Offering Subject created successfully")
                        .apiData(service.create(dto))
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsOfferingSubjectsDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsOfferingSubjectsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Offering Subject fetched successfully")
                        .apiData(service.getById(id))
                        .build());
    }

    @GetMapping("/offering/{offeringId}")
    public ResponseEntity<ApiResponse<List<ImsOfferingSubjectsDto>>> getByOfferingId(
            @PathVariable String offeringId) {

        return ResponseEntity.ok(
                ApiResponse.<List<ImsOfferingSubjectsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Offering Subjects fetched successfully")
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
                        .message("Offering Subject deleted successfully")
                        .apiData(null)
                        .build());
    }
}
