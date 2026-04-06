package com.ims.academic.controller;

import com.ims.academic.dto.ImsExamMasterDto;
import com.ims.academic.dto.ImsExamScheduleDto;
import com.ims.academic.service.ImsExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/exams")
@RequiredArgsConstructor
public class ImsExamController {

    private final ImsExamService examService;

    // Exam Master Endpoints
    @PostMapping
    public ResponseEntity<ImsExamMasterDto> createExam(@RequestBody ImsExamMasterDto dto) {
        return ResponseEntity.ok(examService.createExam(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ImsExamMasterDto> updateExam(@PathVariable String id, @RequestBody ImsExamMasterDto dto) {
        return ResponseEntity.ok(examService.updateExam(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImsExamMasterDto> getExam(@PathVariable String id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<ImsExamMasterDto>> getExamsBySession(
            @PathVariable String sessionId, 
            @RequestParam String tenantId) {
        return ResponseEntity.ok(examService.getExamsBySession(tenantId, sessionId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable String id) {
        examService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/publish")
    public ResponseEntity<Void> publishResults(@PathVariable String id, @RequestParam boolean isPublished) {
        examService.publishResults(id, isPublished);
        return ResponseEntity.ok().build();
    }

    // Scheduling Endpoints
    @PostMapping("/schedule")
    public ResponseEntity<ImsExamScheduleDto> createSchedule(@RequestBody ImsExamScheduleDto dto) {
        return ResponseEntity.ok(examService.createSchedule(dto));
    }

    @GetMapping("/{id}/schedules")
    public ResponseEntity<List<ImsExamScheduleDto>> getSchedulesByExam(@PathVariable String id) {
        return ResponseEntity.ok(examService.getSchedulesByExam(id));
    }

    @GetMapping("/offering/{offeringId}")
    public ResponseEntity<List<ImsExamScheduleDto>> getSchedulesByOffering(
            @PathVariable String offeringId, 
            @RequestParam String tenantId) {
        return ResponseEntity.ok(examService.getSchedulesByOffering(offeringId, tenantId));
    }

    @DeleteMapping("/schedule/{id}")
    public ResponseEntity<Void> deleteSchedule(@PathVariable String id) {
        examService.deleteSchedule(id);
        return ResponseEntity.noContent().build();
    }
}
