package com.ims.academic.controller;

import com.ims.academic.dto.ClassScheduleDto;
import com.ims.academic.service.impl.ClassScheduleServiceImpl;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/offerings/{offeringId}/schedule")
@RequiredArgsConstructor
public class ClassScheduleController {

    private final ClassScheduleServiceImpl service;

    @PostMapping
    public ResponseEntity<ApiResponse<ClassScheduleDto>> addToSchedule(@PathVariable String offeringId,
            @RequestBody ClassScheduleDto dto) {
        dto.setOfferingId(offeringId);
        return new ResponseEntity<>(
                ApiResponse.success(HttpStatus.CREATED.value(), "Schedule entry created", service.create(dto)),
                HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ClassScheduleDto>>> getSchedule(@PathVariable String offeringId) {
        return ResponseEntity
                .ok(ApiResponse.success(HttpStatus.OK.value(), "Offering schedule", service.getByOffering(offeringId)));
    }

    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<Void>> removeFromSchedule(@PathVariable String offeringId,
            @PathVariable String scheduleId) {
        service.delete(scheduleId);
        return ResponseEntity.ok(ApiResponse.success(HttpStatus.OK.value(), "Schedule entry removed", null));
    }
}
