package com.ims.academic.controller;

import com.ims.academic.dto.ImsOfferingClassMappingsDto;
import com.ims.academic.service.ImsOfferingClassMappingsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("offering-class-mappings")
@RequiredArgsConstructor
public class ImsOfferingClassMappingsController {

    private final ImsOfferingClassMappingsService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsOfferingClassMappingsDto>> create(
            @RequestBody ImsOfferingClassMappingsDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsOfferingClassMappingsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Mapping created successfully")
                        .apiData(service.create(dto))
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsOfferingClassMappingsDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsOfferingClassMappingsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Mapping fetched successfully")
                        .apiData(service.getById(id))
                        .build());
    }

    @GetMapping("/offering/{offeringId}")
    public ResponseEntity<ApiResponse<List<ImsOfferingClassMappingsDto>>> getByOfferingId(
            @PathVariable String offeringId) {

        return ResponseEntity.ok(
                ApiResponse.<List<ImsOfferingClassMappingsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Mappings fetched successfully")
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
                        .message("Mapping deleted successfully")
                        .apiData(null)
                        .build());
    }
}
