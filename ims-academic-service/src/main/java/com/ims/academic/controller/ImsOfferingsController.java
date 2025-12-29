package com.ims.academic.controller;

import com.ims.academic.dto.ImsOfferingsDto;
import com.ims.academic.service.ImsOfferingsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("offerings")
@RequiredArgsConstructor
public class ImsOfferingsController {

    private final ImsOfferingsService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsOfferingsDto>> create(@RequestBody ImsOfferingsDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsOfferingsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Offering created successfully")
                        .apiData(service.create(dto))
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsOfferingsDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsOfferingsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Offering fetched successfully")
                        .apiData(service.getById(id))
                        .build()
        );
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<ImsOfferingsDto>>> getByTenant(@PathVariable String tenantId) {
        return ResponseEntity.ok(
                ApiResponse.<List<ImsOfferingsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Offerings fetched successfully")
                        .apiData(service.getByTenant(tenantId))
                        .build()
        );
    }

    @GetMapping("/program/{programId}")
    public ResponseEntity<ApiResponse<List<ImsOfferingsDto>>> getByProgram(@PathVariable String programId) {
        return ResponseEntity.ok(
                ApiResponse.<List<ImsOfferingsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Offerings fetched successfully")
                        .apiData(service.getByProgram(programId))
                        .build()
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {

        service.delete(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Offering deleted successfully")
                        .apiData(null)
                        .build()
        );
    }
}
