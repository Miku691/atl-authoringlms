package com.ims.student.service;

import com.ims.student.dto.StudentLeaveDto;
import java.util.List;

public interface ImsStudentLeavesService {
    StudentLeaveDto applyLeave(StudentLeaveDto dto);
    StudentLeaveDto updateLeaveStatus(String id, String status, String remarks, String approvedBy);
    List<StudentLeaveDto> getStudentLeaves(String studentId);
    List<StudentLeaveDto> getTenantLeaves(String tenantId);
    List<StudentLeaveDto> getPendingLeaves(String tenantId);
}
