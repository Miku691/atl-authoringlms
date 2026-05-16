package com.ims.academic.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.ims.academic.client.InstructorClient;
import com.ims.academic.dto.ImsOfferingsDto;
import com.ims.academic.dto.InstructorAssignmentDto;
import com.ims.academic.dto.external.ImsInstructorSubjectsDto;
import com.ims.academic.entity.ImsOfferingInstructors;
import com.ims.academic.entity.ImsOfferings;
import com.ims.academic.enums.OfferingStatus;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsOfferingInstructorsRepo;
import com.ims.academic.repo.ImsOfferingSubjectRepo;
import com.ims.academic.repo.ImsOfferingsRepo;
import com.ims.academic.service.ImsOfferingsService;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImsOfferingsServiceImpl implements ImsOfferingsService {

    private final ImsOfferingsRepo repo;
    private final com.ims.academic.repo.AcademicSessionRepo academicSessionRepo;
    private final ImsOfferingSubjectRepo offeringSubjectsRepo;
    private final ImsOfferingInstructorsRepo offeringInstructorsRepo;
    private final InstructorClient instructorClient;
    private final ModelMapper modelMapper;
    private final ObjectMapper objectMapper;

    private ImsOfferingsDto toDto(ImsOfferings entity) {
        ImsOfferingsDto dto = modelMapper.map(entity, ImsOfferingsDto.class);
        if (entity.getSession() != null) {
            dto.setSessionId(entity.getSession().getId());
            dto.setSessionStatus(entity.getSession().getStatus().name()); // Capture status for cross-service validation
            if (entity.getSession().getProgram() != null) {
                dto.setProgramId(entity.getSession().getProgram().getId());
            }
        }
        dto.setStatus(computeStatus(entity));
        return dto;
    }

    private OfferingStatus computeStatus(ImsOfferings entity) {
        // 1. Check Metadata Override
        if (entity.getMetadata() != null) {
            try {
                JsonNode root = objectMapper.readTree(entity.getMetadata());
                if (root.has("status") && "INACTIVE".equalsIgnoreCase(root.get("status").asText())) {
                    return OfferingStatus.INACTIVE;
                }
            } catch (Exception e) {
                log.warn("Failed to parse metadata for offering: {}", entity.getId(), e);
            }
        }

        // 2. Date Logic
        LocalDate now = LocalDate.now();
        if (entity.getStartDate() != null && now.isBefore(entity.getStartDate())) {
            return OfferingStatus.UPCOMING;
        }
        if (entity.getEndDate() != null && now.isAfter(entity.getEndDate())) {
            return OfferingStatus.INACTIVE;
        }

        return OfferingStatus.ACTIVE;
    }

    @Override
    public ImsOfferingsDto create(ImsOfferingsDto dto) {
        com.ims.academic.entity.AcademicSession session;
        if (dto.getSessionId() == null) {
            session = academicSessionRepo.findFirstByTenantIdAndIsCurrentTrue(dto.getTenantId())
                .orElseThrow(() -> new IllegalArgumentException("No active session found for tenant"));
            dto.setSessionId(session.getId());
        } else {
            session = academicSessionRepo.findById(dto.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session ID", dto.getSessionId()));
        }

        // Idempotency: Return existing if matches name, session, and specific container ID
        List<ImsOfferings> existingOfferings = repo.findExactDuplicate(
                dto.getName(), 
                dto.getSessionId(), 
                dto.getClassId(), 
                dto.getYearId(), 
                dto.getCourseId()
        );
        
        if (!existingOfferings.isEmpty()) {
            dto.setId(existingOfferings.get(0).getId());
        }

        if (dto.getId() != null) {
            log.info("Offering {} already exists, returning existing.", dto.getName());
            return getById(dto.getId());
        }

        ImsOfferings offering = modelMapper.map(dto, ImsOfferings.class);
        offering.setSession(session);

        ImsOfferings saved = repo.save(offering);
        ImsOfferingsDto result = toDto(saved);
        result.setId(saved.getId()); // Explicit assurance that ID is propagated
        return result;
    }

    @Override
    public ImsOfferingsDto update(String id, ImsOfferingsDto dto) {

        ImsOfferings existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offering ID", id));

        if (dto.getName() != null)
            existing.setName(dto.getName());
        if (dto.getType() != null)
            existing.setType(dto.getType());
        if (dto.getStartDate() != null)
            existing.setStartDate(dto.getStartDate());
        if (dto.getEndDate() != null)
            existing.setEndDate(dto.getEndDate());
        if (dto.getCapacity() != null)
            existing.setCapacity(dto.getCapacity());
        if (dto.getMetadata() != null)
            existing.setMetadata(dto.getMetadata());

        return toDto(repo.save(existing));
    }

    @Override
    public ImsOfferingsDto getById(String id) {
        return repo.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Offering ID", id));
    }

    @Override
    public List<ImsOfferingsDto> getByTenant(String tenantId) {
        return repo.findByTenantId(tenantId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsOfferingsDto> getByProgram(String programId) {
        return repo.findBySession_ProgramId(programId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsOfferingsDto> getByInstructor(String instructorId) {
        return repo.findByInstructorId(instructorId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Offering ID", id);
        }
        repo.deleteById(id);
    }

    @Override
    public ImsOfferingsDto activate(String id) {
        // Enforce Subject Coverage before activation
        com.ims.academic.dto.CoverageStatusDto coverage = getCoverageStatus(id);
        if (!coverage.isCovered()) {
            throw new IllegalStateException("Cannot activate offering. Missing instructor assignments for subjects: "
                    + coverage.getMissingSubjects());
        }
        return updateStatus(id, "ACTIVE");
    }

    @Override
    public ImsOfferingsDto deactivate(String id) {
        return updateStatus(id, "INACTIVE");
    }

    private ImsOfferingsDto updateStatus(String id, String status) {
        ImsOfferings existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Offering ID", id));

        try {
            ObjectNode root;
            if (existing.getMetadata() == null || existing.getMetadata().isEmpty()) {
                root = objectMapper.createObjectNode();
            } else {
                root = (ObjectNode) objectMapper.readTree(existing.getMetadata());
            }

            if ("INACTIVE".equals(status)) {
                root.put("status", "INACTIVE");
            } else {
                root.remove("status"); // Active is default, remove override
            }

            existing.setMetadata(objectMapper.writeValueAsString(root));
            return toDto(repo.save(existing));

        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to update status: " + e.getMessage());
        }
    }

    @Override
    public com.ims.academic.dto.CoverageStatusDto getCoverageStatus(String offeringId) {
        if (!repo.existsById(offeringId)) {
            throw new ResourceNotFoundException("Offering ID", offeringId);
        }

        // 1. Get Required Subjects
        List<com.ims.academic.entity.ImsOfferingSubject> required = offeringSubjectsRepo.findByOfferingId(offeringId);
        if (required.isEmpty()) {
            return com.ims.academic.dto.CoverageStatusDto.builder()
                    .isCovered(true)
                    .message("No subjects mapped to this offering.")
                    .missingSubjects(java.util.Collections.emptyList())
                    .build();
        }

        // 2. Get Active Assignments
        List<ImsOfferingInstructors> assigned = offeringInstructorsRepo.findByOfferingId(offeringId);
        LocalDate now = LocalDate.now();

        List<String> coveredSubjectIds = assigned.stream()
                .filter(a -> a.getStartDate() != null && !now.isBefore(a.getStartDate()))
                .filter(a -> a.getEndDate() == null || !now.isAfter(a.getEndDate()))
                .map(ImsOfferingInstructors::getSubjectId)
                .collect(Collectors.toList());

        // 3. Diff
        List<String> missing = required.stream()
                .map(s -> s.getSubject().getId())
                .filter(sId -> !coveredSubjectIds.contains(sId))
                .collect(Collectors.toList());

        return com.ims.academic.dto.CoverageStatusDto.builder()
                .isCovered(missing.isEmpty())
                .missingSubjects(missing)
                .message(missing.isEmpty() ? "All subjects covered."
                        : "Missing instructors for " + missing.size() + " subjects.")
                .build();
    }

    @Override
    public List<ImsOfferingsDto> getByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        return repo.findAllById(ids).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public InstructorAssignmentDto assignInstructor(InstructorAssignmentDto dto) {
        // 1. Validate Offering Exists
        if (!repo.existsById(dto.getOfferingId())) {
            throw new ResourceNotFoundException("Offering ID", dto.getOfferingId());
        }

        // 2. Validate Subject is part of Offering
        if (!offeringSubjectsRepo.existsByOfferingIdAndSubjectId(dto.getOfferingId(), dto.getSubjectId())) {
            throw new IllegalArgumentException(
                    "Subject ID " + dto.getSubjectId() + " is not mapped to Offering ID " + dto.getOfferingId());
        }

        // 3. Validate Instructor Capability via Client
        try {
            ApiResponse<List<ImsInstructorSubjectsDto>> response = instructorClient
                    .getSubjectsByInstructor(dto.getInstructorId());
            if (response == null || !"SUCCESS".equals(response.getStatus()) || response.getApiData() == null) {
                throw new ResourceNotFoundException("Instructor ID", dto.getInstructorId());
            }

            boolean isCapable = response.getApiData().stream()
                    .anyMatch(s -> s.getSubjectId().equals(dto.getSubjectId()));

            if (!isCapable) {
                throw new IllegalArgumentException("Instructor " + dto.getInstructorId()
                        + " is not authorized to teach Subject " + dto.getSubjectId());
            }

        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to validate instructor capability: " + e.getMessage());
        }

        ImsOfferingInstructors entity = ImsOfferingInstructors.builder()
                .offeringId(dto.getOfferingId())
                .instructorId(dto.getInstructorId())
                .subjectId(dto.getSubjectId())
                .role(dto.getRole())
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .build();

        ImsOfferingInstructors saved = offeringInstructorsRepo.save(entity);

        return InstructorAssignmentDto.builder()
                .id(saved.getId())
                .offeringId(saved.getOfferingId())
                .instructorId(saved.getInstructorId())
                .subjectId(saved.getSubjectId())
                .role(saved.getRole())
                .startDate(saved.getStartDate())
                .endDate(saved.getEndDate())
                .build();
    }

    @Override
    public boolean hasActiveOfferings(String tenantId) {
        return repo.findByTenantId(tenantId).stream()
                .map(this::computeStatus)
                .anyMatch(status -> status == OfferingStatus.ACTIVE);
    }

    @Override
    public long countByTenant(String tenantId) {
        return repo.countByTenantId(tenantId);
    }
}