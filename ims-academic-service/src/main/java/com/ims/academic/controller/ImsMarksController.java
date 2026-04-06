package com.ims.academic.controller;

import com.ims.academic.dto.ImsMarksRecordDto;
import com.ims.academic.service.ImsMarksService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/marks")
@RequiredArgsConstructor
public class ImsMarksController {

    private final ImsMarksService marksService;

    // Bulk marks submission for instructors
    @PostMapping("/schedule/{scheduleId}/bulk")
    public ResponseEntity<Void> saveBulkMarks(
            @PathVariable String scheduleId,
            @RequestBody List<ImsMarksRecordDto> marksList,
            @RequestParam String tenantId) {
        marksService.saveBulkMarks(scheduleId, marksList, tenantId);
        return ResponseEntity.ok().build();
    }

    // Get marks for a specific scheduled paper (to pre-populate gradebook)
    @GetMapping("/schedule/{scheduleId}")
    public ResponseEntity<List<ImsMarksRecordDto>> getMarksBySchedule(@PathVariable String scheduleId) {
        return ResponseEntity.ok(marksService.getMarksBySchedule(scheduleId));
    }

    // Get individual student's full result (for report cards)
    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<ImsMarksRecordDto>> getResultsByStudent(
            @PathVariable String studentId,
            @RequestParam String tenantId) {
        return ResponseEntity.ok(marksService.getResultsByStudent(studentId, tenantId));
    }

    // Individual marks update
    @PostMapping
    public ResponseEntity<ImsMarksRecordDto> saveIndividualMark(@RequestBody ImsMarksRecordDto dto) {
        return ResponseEntity.ok(marksService.saveIndividualMark(dto));
    }
}
