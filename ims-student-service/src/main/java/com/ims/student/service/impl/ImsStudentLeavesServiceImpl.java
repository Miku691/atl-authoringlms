package com.ims.student.service.impl;

import com.ims.student.dto.StudentLeaveDto;
import com.ims.student.entity.ImsStudentLeaves;
import com.ims.student.exception.ResourceNotFoundException;
import com.ims.student.repo.ImsStudentLeavesRepo;
import com.ims.student.service.ImsStudentLeavesService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsStudentLeavesServiceImpl implements ImsStudentLeavesService {

    private final ImsStudentLeavesRepo repo;
    private final ModelMapper modelMapper;

    @Override
    public StudentLeaveDto applyLeave(StudentLeaveDto dto) {
        ImsStudentLeaves entity = modelMapper.map(dto, ImsStudentLeaves.class);
        if (entity.getStatus() == null) {
            entity.setStatus("PENDING");
        }
        ImsStudentLeaves saved = repo.save(entity);
        return modelMapper.map(saved, StudentLeaveDto.class);
    }

    @Override
    public StudentLeaveDto updateLeaveStatus(String id, String status, String remarks, String approvedBy) {
        ImsStudentLeaves existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Leave application not found", id));
        existing.setStatus(status);
        existing.setRemarks(remarks);
        existing.setApprovedBy(approvedBy);
        ImsStudentLeaves updated = repo.save(existing);
        return modelMapper.map(updated, StudentLeaveDto.class);
    }

    @Override
    public List<StudentLeaveDto> getStudentLeaves(String studentId) {
        return repo.findByStudentId(studentId).stream()
                .map(e -> modelMapper.map(e, StudentLeaveDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentLeaveDto> getTenantLeaves(String tenantId) {
        return repo.findByTenantId(tenantId).stream()
                .map(e -> modelMapper.map(e, StudentLeaveDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentLeaveDto> getPendingLeaves(String tenantId) {
        return repo.findByStatusAndTenantId("PENDING", tenantId).stream()
                .map(e -> modelMapper.map(e, StudentLeaveDto.class))
                .collect(Collectors.toList());
    }
}
