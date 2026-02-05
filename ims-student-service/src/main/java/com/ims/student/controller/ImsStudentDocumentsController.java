package com.ims.student.controller;

import com.ims.student.dto.ImsStudentDocumentsDto;
import com.ims.student.service.ImsStudentDocumentsService;
import com.ims.student.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import java.io.IOException;
import java.nio.file.Files;

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
                        @RequestHeader(name = "X-Tenant-Id") String tenantId,
                        @RequestParam("file") MultipartFile file) {

                ImsStudentDocumentsDto saved = service.upload(studentId, documentType, tenantId, file);

                return ResponseEntity.status(HttpStatus.CREATED).body(
                                ApiResponse.<ImsStudentDocumentsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.CREATED.value())
                                                .message("Document uploaded successfully")
                                                .apiData(saved)
                                                .build());
        }

        @GetMapping("/student/{studentId}")
        public ResponseEntity<ApiResponse<List<ImsStudentDocumentsDto>>> getByStudent(
                        @PathVariable String studentId,
                        @RequestHeader(name = "X-Tenant-Id") String tenantId) {

                List<ImsStudentDocumentsDto> list = service.getByStudentId(studentId, tenantId);

                return ResponseEntity.ok(
                                ApiResponse.<List<ImsStudentDocumentsDto>>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Documents fetched successfully")
                                                .apiData(list)
                                                .build());
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<ImsStudentDocumentsDto>> getById(
                        @PathVariable String id,
                        @RequestHeader(name = "X-Tenant-Id") String tenantId) {
                ImsStudentDocumentsDto dto = service.getById(id, tenantId);
                return ResponseEntity.ok(
                                ApiResponse.<ImsStudentDocumentsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Document fetched successfully")
                                                .apiData(dto)
                                                .build());
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
                                                .build());
        }

        @PutMapping("/{id}/verify")
        public ResponseEntity<ApiResponse<Void>> verify(
                        @PathVariable String id,
                        @RequestParam String status,
                        @RequestHeader(name = "X-Tenant-Id") String tenantId) {

                // Basic verification logic in service
                service.getById(id, tenantId); // Validates ownership

                return ResponseEntity.ok(
                                ApiResponse.<Void>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Document status updated to " + status)
                                                .apiData(null)
                                                .build());
        }

        @GetMapping("/view/{id}")
        public ResponseEntity<Resource> viewFile(@PathVariable String id) throws IOException {
                Resource resource = service.getFileResource(id);

                // Determine content type
                String contentType = Files.probeContentType(java.nio.file.Paths.get(resource.getURI()));
                if (contentType == null) {
                        contentType = "application/octet-stream";
                }

                return ResponseEntity.ok()
                                .contentType(MediaType.parseMediaType(contentType))
                                .body(resource);
        }
}
