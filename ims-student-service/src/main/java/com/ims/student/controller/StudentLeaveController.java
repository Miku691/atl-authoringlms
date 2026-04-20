package com.ims.student.controller;

import com.ims.student.dto.StudentLeaveDto;
import com.ims.student.service.ImsStudentLeavesService;
import com.ims.student.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for managing student leave applications.
 */
@RestController
@RequestMapping("/leaves")
@RequiredArgsConstructor
public class StudentLeaveController {

    private final ImsStudentLeavesService leaveService;

    /**
     * Applies for a new leave.
     *
     * @param dto leave details
     * @return created leave record
     */
    @PostMapping
    public ApiResponse<StudentLeaveDto> applyLeave(@RequestBody StudentLeaveDto dto) {
        return ApiResponse.success(201, "Leave applied successfully", leaveService.applyLeave(dto));
    }

    /**
     * Updates the status of a leave application (Approve/Reject).
     *
     * @param id leave application ID
     * @param status new status
     * @param remarks approval/rejection remarks
     * @param approvedBy user ID of the approver
     * @return updated leave record
     */
    @PatchMapping("/{id}/status")
    public ApiResponse<StudentLeaveDto> updateStatus(
            @PathVariable String id,
            @RequestParam String status,
            @RequestParam(required = false) String remarks,
            @RequestParam String approvedBy) {
        return ApiResponse.success(200, "Leave status updated", 
                leaveService.updateLeaveStatus(id, status, remarks, approvedBy));
    }

    /**
     * Retrieves leave history for a specific student.
     *
     * @param studentId student ID
     * @return list of leave applications
     */
    @GetMapping("/student/{studentId}")
    public ApiResponse<List<StudentLeaveDto>> getStudentLeaves(@PathVariable String studentId) {
        return ApiResponse.success(200, null, leaveService.getStudentLeaves(studentId));
    }

    /**
     * Retrieves all leave applications for a specific tenant.
     *
     * @param tenantId tenant ID
     * @return list of leave applications
     */
    @GetMapping("/tenant/{tenantId}")
    public ApiResponse<List<StudentLeaveDto>> getTenantLeaves(@PathVariable String tenantId) {
        return ApiResponse.success(200, null, leaveService.getTenantLeaves(tenantId));
    }

    /**
     * Retrieves all pending leave applications for a specific tenant.
     *
     * @param tenantId tenant ID
     * @return list of pending leave applications
     */
    @GetMapping("/tenant/{tenantId}/pending")
    public ApiResponse<List<StudentLeaveDto>> getPendingLeaves(@PathVariable String tenantId) {
        return ApiResponse.success(200, null, leaveService.getPendingLeaves(tenantId));
    }
}
