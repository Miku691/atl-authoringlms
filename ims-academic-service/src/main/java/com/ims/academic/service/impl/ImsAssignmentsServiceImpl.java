package com.ims.academic.service.impl;

import com.ims.academic.dto.ImsAssignmentsDto;
import com.ims.academic.entity.ImsAssignments;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsAssignmentsRepo;
import com.ims.academic.service.ImsAssignmentsService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsAssignmentsServiceImpl implements ImsAssignmentsService {

    private final ImsAssignmentsRepo repo;
    private final com.ims.academic.repo.ImsAssignmentSubmissionsRepo submissionRepo;
    private final ModelMapper modelMapper;

    private ImsAssignmentsDto toDto(ImsAssignments entity) {
        return modelMapper.map(entity, ImsAssignmentsDto.class);
    }

    private ImsAssignments toEntity(ImsAssignmentsDto dto) {
        return modelMapper.map(dto, ImsAssignments.class);
    }

    @Override
    @Transactional
    public ImsAssignmentsDto create(ImsAssignmentsDto dto) {
        ImsAssignments entity = toEntity(dto);
        // tenantId should be set from controller or extracted from context if available
        // For now, assume it's in DTO or set explicitly
        if (entity.getSubmissions() != null) {
            entity.getSubmissions().forEach(sub -> sub.setAssignment(entity));
        }

        return toDto(repo.save(entity));
    }

    @Override
    @Transactional
    public ImsAssignmentsDto update(String id, ImsAssignmentsDto dto) {
        ImsAssignments existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment ID", id));

        // existing.setTenantId(dto.getTenantId()); // Should ideally not change
        existing.setOfferingId(dto.getOfferingId());
        existing.setSubjectId(dto.getSubjectId());
        existing.setTitle(dto.getTitle());
        existing.setDescription(dto.getDescription());
        existing.setDueDate(dto.getDueDate());
        existing.setCreatedBy(dto.getCreatedBy());

        return toDto(repo.save(existing));
    }

    @Override
    public ImsAssignmentsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment ID", id));
    }

    @Override
    public List<ImsAssignmentsDto> getByOfferingId(String offeringId) {
        // This needs tenant isolation too, but keeping it simple for now as per old
        // contract or adding tenantId if possible
        // Let's assume we want all assignments for offering for now, but repo changed.
        return repo.findAll().stream() // Temporary fallback or refine repo further
                .filter(a -> a.getOfferingId().equals(offeringId))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<ImsAssignmentsDto> getByTenantAndOffering(String tenantId, String offeringId) {
        return repo.findByTenantIdAndOfferingId(tenantId, offeringId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public com.ims.academic.dto.StudentAssignmentSummaryDto getStudentSummary(String offeringId, String studentId, String tenantId) {
        List<ImsAssignments> totalAssignments = repo.findByTenantIdAndOfferingId(tenantId, offeringId);
        long totalCount = totalAssignments.size();

        long completedCount = submissionRepo.findByStudentId(studentId).stream()
                .filter(sub -> totalAssignments.stream()
                        .anyMatch(a -> a.getId().equals(sub.getAssignment().getId())))
                .count();

        return com.ims.academic.dto.StudentAssignmentSummaryDto.builder()
                .totalAssignments(totalCount)
                .completedAssignments(completedCount)
                .pendingAssignments(Math.max(0, totalCount - completedCount))
                .build();
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Assignment ID", id);
        }
        repo.deleteById(id);
    }
}
