package com.ims.academic.controller;

import com.ims.academic.dto.ImsTopicsDto;
import com.ims.academic.service.ImsTopicsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("topics")
@RequiredArgsConstructor
public class ImsTopicsController {

        private final ImsTopicsService service;

        @PostMapping
        public ResponseEntity<ApiResponse<ImsTopicsDto>> create(@RequestBody ImsTopicsDto dto) {
                return ResponseEntity.status(HttpStatus.CREATED).body(
                                ApiResponse.<ImsTopicsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.CREATED.value())
                                                .message("Topic created successfully")
                                                .apiData(service.create(dto))
                                                .build());
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<ImsTopicsDto>> getById(@PathVariable String id) {
                return ResponseEntity.ok(
                                ApiResponse.<ImsTopicsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Topic fetched successfully")
                                                .apiData(service.getById(id))
                                                .build());
        }

        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<ImsTopicsDto>> update(@PathVariable String id,
                        @RequestBody ImsTopicsDto dto) {
                return ResponseEntity.ok(
                                ApiResponse.<ImsTopicsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Topic updated successfully")
                                                .apiData(service.update(id, dto))
                                                .build());
        }

        @GetMapping("/chapter/{chapterId}")
        public ResponseEntity<ApiResponse<List<ImsTopicsDto>>> getByChapterId(
                        @PathVariable String chapterId) {

                return ResponseEntity.ok(
                                ApiResponse.<List<ImsTopicsDto>>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Topics fetched successfully")
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
                                                .message("Topic deleted successfully")
                                                .apiData(null)
                                                .build());
        }
}
