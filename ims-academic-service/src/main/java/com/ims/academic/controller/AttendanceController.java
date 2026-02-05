package com.ims.academic.controller;

import com.ims.academic.dto.AttendanceBatchRequestDto;
import com.ims.academic.dto.AttendanceRecordDto;
import com.ims.academic.dto.MessageDto;
import com.ims.academic.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Controller for managing attendance.
 */
@RestController
@RequestMapping("/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/tenant/{tenantId}/bulk")
    public ResponseEntity<MessageDto> markBulkAttendance(
            @PathVariable String tenantId,
            @RequestBody AttendanceBatchRequestDto request) {
        return ResponseEntity.ok(attendanceService.markBulkAttendance(tenantId, request));
    }

    @GetMapping("/offering/{offeringId}")
    public ResponseEntity<List<AttendanceRecordDto>> getAttendanceByOfferingAndDate(
            @PathVariable String offeringId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByOfferingAndDate(offeringId, date));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceRecordDto>> getStudentAttendance(@PathVariable String studentId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendance(studentId));
    }

    @GetMapping("/tenant/{tenantId}/staff")
    public ResponseEntity<List<AttendanceRecordDto>> getAttendanceByTenantAndDate(
            @PathVariable String tenantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getAttendanceByTenantAndDate(tenantId, date));
    }

    @GetMapping("/stats/{personId}")
    public ResponseEntity<com.ims.academic.dto.AttendanceSummaryDto> getMonthlyStats(
            @PathVariable String personId,
            @RequestParam String personType,
            @RequestParam int month,
            @RequestParam int year) {
        return ResponseEntity.ok(attendanceService.getMonthlyStats(personId, personType, month, year));
    }

    @PutMapping("/tenant/{tenantId}/{id}")
    public ResponseEntity<MessageDto> updateIndividualRecord(
            @PathVariable String tenantId,
            @PathVariable String id,
            @RequestBody AttendanceRecordDto recordDto) {
        return ResponseEntity.ok(attendanceService.updateIndividualRecord(tenantId, id, recordDto));
    }
}
