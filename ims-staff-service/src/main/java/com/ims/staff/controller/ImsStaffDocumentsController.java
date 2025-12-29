package com.ims.staff.controller;

import com.ims.staff.dto.ImsStaffDocumentsDto;
import com.ims.staff.service.ImsStaffDocumentsService;
import com.ims.staff.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/staff-documents")
@RequiredArgsConstructor
public class ImsStaffDocumentsController {

    private final ImsStaffDocumentsService service;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ImsStaffDocumentsDto>> upload(
            @RequestParam String staffId,
            @RequestParam String documentType,
            @RequestParam MultipartFile file
    ) {
        ImsStaffDocumentsDto dto = service.uploadDocument(staffId, documentType, file);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsStaffDocumentsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Staff document uploaded successfully")
                        .apiData(dto)
                        .build()
        );
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<ApiResponse<List<ImsStaffDocumentsDto>>> getByStaff(
            @PathVariable String staffId) {

        return ResponseEntity.ok(
                ApiResponse.<List<ImsStaffDocumentsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Staff documents fetched successfully")
                        .apiData(service.getByStaff(staffId))
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsStaffDocumentsDto>> getById(@PathVariable String id) {

        return ResponseEntity.ok(
                ApiResponse.<ImsStaffDocumentsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Staff document fetched successfully")
                        .apiData(service.getById(id))
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
                        .message("Staff document deleted successfully")
                        .apiData(null)
                        .build()
        );
    }
}