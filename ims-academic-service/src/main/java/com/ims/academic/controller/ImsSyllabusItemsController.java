package com.ims.academic.controller;

import com.ims.academic.dto.ImsSyllabusItemsDto;
import com.ims.academic.service.ImsSyllabusItemsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("syllabus-items")
@RequiredArgsConstructor
public class ImsSyllabusItemsController {

    private final ImsSyllabusItemsService service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsSyllabusItemsDto>> create(@RequestBody ImsSyllabusItemsDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsSyllabusItemsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Syllabus Item created successfully")
                        .apiData(service.create(dto))
                        .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsSyllabusItemsDto>> getById(@PathVariable String id) {
        return ResponseEntity.ok(
                ApiResponse.<ImsSyllabusItemsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Syllabus Item fetched successfully")
                        .apiData(service.getById(id))
                        .build());
    }

    @GetMapping("/chapter/{chapterId}")
    public ResponseEntity<ApiResponse<List<ImsSyllabusItemsDto>>> getByChapterId(
            @PathVariable String chapterId) {

        return ResponseEntity.ok(
                ApiResponse.<List<ImsSyllabusItemsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Syllabus Items fetched successfully")
                        .apiData(service.getByChapterId(chapterId))
                        .build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {

        service.delete(id);

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Syllabus Item deleted successfully")
                        .apiData(null)
                        .build());
    }
}
