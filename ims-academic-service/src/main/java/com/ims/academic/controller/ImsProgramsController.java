package com.ims.academic.controller;

import com.ims.academic.dto.ImsProgramsDto;
import com.ims.academic.service.ImsProgramsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("programs")
@RequiredArgsConstructor
public class ImsProgramsController {

    private final ImsProgramsService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsProgramsDto>> create(@RequestBody ImsProgramsDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsProgramsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Program created successfully")
                        .apiData(service.create(dto))
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsProgramsDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsProgramsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Program fetched successfully")
                        .apiData(service.getById(id))
                        .build()
        );
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<ImsProgramsDto>>> getByTenant(
            @PathVariable String tenantId) {

        return ResponseEntity.ok(
                ApiResponse.<List<ImsProgramsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Programs fetched successfully")
                        .apiData(service.getByTenant(tenantId))
                        .build()
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ImsProgramsDto>>> getAll() {
        return ResponseEntity.ok(
                ApiResponse.<List<ImsProgramsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("All programs fetched")
                        .apiData(service.getAll())
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
                        .message("Program deleted successfully")
                        .apiData(null)
                        .build()
        );
    }
}
