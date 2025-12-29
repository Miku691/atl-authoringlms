package com.ims.student.controller;

import com.ims.student.dto.ImsStudentDocumentsDto;
import com.ims.student.service.ImsStudentDocumentsService;
import com.ims.student.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("student-documents")
@RequiredArgsConstructor
public class ImsStudentDocumentsController {

    private final ImsStudentDocumentsService service;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<ImsStudentDocumentsDto>> upload(
            @RequestParam String studentId,
            @RequestParam String documentType,
            @RequestParam("file") MultipartFile file) {

        ImsStudentDocumentsDto saved = service.upload(studentId, documentType, file);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<ImsStudentDocumentsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Document uploaded successfully")
                        .apiData(saved)
                        .build()
        );
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<ImsStudentDocumentsDto>>> getByStudent(
            @PathVariable String studentId) {

        List<ImsStudentDocumentsDto> list = service.getByStudentId(studentId);

        return ResponseEntity.ok(
                ApiResponse.<List<ImsStudentDocumentsDto>>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Documents fetched successfully")
                        .apiData(list)
                        .build()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ImsStudentDocumentsDto>> getById(@PathVariable String id) {
        ImsStudentDocumentsDto dto = service.getById(id);
        return ResponseEntity.ok(
                ApiResponse.<ImsStudentDocumentsDto>builder()
                        .status("SUCCESS")
                        .statusCode(HttpStatus.OK.value())
                        .message("Document fetched successfully")
                        .apiData(dto)
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
                        .message("Document deleted successfully")
                        .apiData(null)
                        .build()
        );
    }
}
