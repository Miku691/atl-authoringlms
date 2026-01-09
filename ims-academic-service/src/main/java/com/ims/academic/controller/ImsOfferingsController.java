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
                                                .build());
        }

        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<ImsOfferingsDto>> getById(@PathVariable String id) {
                return ResponseEntity.ok(
                                ApiResponse.<ImsOfferingsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Offering fetched successfully")
                                                .apiData(service.getById(id))
                                                .build());
        }

        @GetMapping("/tenant/{tenantId}")
        public ResponseEntity<ApiResponse<List<ImsOfferingsDto>>> getByTenant(@PathVariable String tenantId) {
                return ResponseEntity.ok(
                                ApiResponse.<List<ImsOfferingsDto>>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Offerings fetched successfully")
                                                .apiData(service.getByTenant(tenantId))
                                                .build());
        }

        @GetMapping("/program/{programId}")
        public ResponseEntity<ApiResponse<List<ImsOfferingsDto>>> getByProgram(@PathVariable String programId) {
                return ResponseEntity.ok(
                                ApiResponse.<List<ImsOfferingsDto>>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Offerings fetched successfully")
                                                .apiData(service.getByProgram(programId))
                                                .build());
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
                                                .build());
        }

        @PatchMapping("/{id}/activate")
        public ResponseEntity<ApiResponse<ImsOfferingsDto>> activate(@PathVariable String id) {
                return ResponseEntity.ok(
                                ApiResponse.<ImsOfferingsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Offering activated successfully")
                                                .apiData(service.activate(id))
                                                .build());
        }

        @PatchMapping("/{id}/deactivate")
        public ResponseEntity<ApiResponse<ImsOfferingsDto>> deactivate(@PathVariable String id) {
                return ResponseEntity.ok(
                                ApiResponse.<ImsOfferingsDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Offering deactivated successfully")
                                                .apiData(service.deactivate(id))
                                                .build());
        }

        @PostMapping("/{id}/instructors")
        public ResponseEntity<ApiResponse<com.ims.academic.dto.InstructorAssignmentDto>> assignInstructor(
                        @PathVariable String id,
                        @RequestBody com.ims.academic.dto.InstructorAssignmentDto dto) {

                // Ensure path ID matches DTO ID for safety
                dto.setOfferingId(id);

                return ResponseEntity.status(HttpStatus.CREATED).body(
                                ApiResponse.<com.ims.academic.dto.InstructorAssignmentDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.CREATED.value())
                                                .message("Instructor assigned successfully")
                                                .apiData(service.assignInstructor(dto))
                                                .build());
        }

        @GetMapping("/{id}/coverage")
        public ResponseEntity<ApiResponse<com.ims.academic.dto.CoverageStatusDto>> getCoverageStatus(
                        @PathVariable String id) {
                return ResponseEntity.ok(
                                ApiResponse.<com.ims.academic.dto.CoverageStatusDto>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Coverage status fetched")
                                                .apiData(service.getCoverageStatus(id))
                                                .build());
        }

        @PostMapping("/bulk-fetch")
        public ResponseEntity<ApiResponse<List<ImsOfferingsDto>>> getByIds(@RequestBody List<String> ids) {
                return ResponseEntity.ok(
                                ApiResponse.<List<ImsOfferingsDto>>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Offerings fetched successfully")
                                                .apiData(service.getByIds(ids))
                                                .build());
        }

        @GetMapping("/tenant/{tenantId}/has-active")
        public ResponseEntity<ApiResponse<Boolean>> hasActiveOfferings(@PathVariable String tenantId) {
                return ResponseEntity.ok(
                                ApiResponse.<Boolean>builder()
                                                .status("SUCCESS")
                                                .statusCode(HttpStatus.OK.value())
                                                .message("Checked active offerings")
                                                .apiData(service.hasActiveOfferings(tenantId))
                                                .build());
        }
}
