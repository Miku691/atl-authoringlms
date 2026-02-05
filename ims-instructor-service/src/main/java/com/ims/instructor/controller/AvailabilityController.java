package com.ims.instructor.controller;

import com.ims.instructor.dto.ImsInstructorAvailabilityDto;
import com.ims.instructor.service.impl.ImsInstructorAvailabilityServiceImpl;
import com.ims.instructor.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/instructors/availability")
@RequiredArgsConstructor
public class AvailabilityController {

    private final ImsInstructorAvailabilityServiceImpl service;

    @PostMapping
    public ResponseEntity<ApiResponse<ImsInstructorAvailabilityDto>> setAvailability(
            @RequestBody ImsInstructorAvailabilityDto dto) {
        return ResponseEntity
                .ok(ApiResponse.success(HttpStatus.OK.value(), "Availability set", service.setAvailability(dto)));
    }

    @GetMapping("/{instructorId}")
    public ResponseEntity<ApiResponse<List<ImsInstructorAvailabilityDto>>> getAvailability(
            @PathVariable String instructorId) {
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Availability fetched",
                service.getByInstructor(instructorId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String id) {
        service.delete(id);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Availability deleted", null));
    }
}
