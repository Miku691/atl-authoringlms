package com.ims.academic.controller;

import com.ims.academic.dto.ImsSyllabusPacksDto;
import com.ims.academic.service.ImsSyllabusPacksService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("syllabus-packs")
@RequiredArgsConstructor
public class ImsSyllabusPacksController {

    private final ImsSyllabusPacksService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsSyllabusPacksDto>> create(@RequestBody ImsSyllabusPacksDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsSyllabusPacksDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Syllabus Pack created successfully")
                        .apiData(service.create(dto))
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsSyllabusPacksDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsSyllabusPacksDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Syllabus Pack fetched successfully")
                        .apiData(service.getById(id))
                        .build());
    }

    @GetMapping("/tenant/{tenantId}")
    public ResponseEntity<ApiResponse<List<ImsSyllabusPacksDto>>> getByTenantId(
            @PathVariable String tenantId) {

        return ResponseEntity.ok(
                ApiResponse.<List<ImsSyllabusPacksDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Syllabus Packs fetched successfully")
                        .apiData(service.getByTenantId(tenantId))
                        .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {

        service.delete(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Syllabus Pack deleted successfully")
                        .apiData(null)
                        .build());
    }
}
