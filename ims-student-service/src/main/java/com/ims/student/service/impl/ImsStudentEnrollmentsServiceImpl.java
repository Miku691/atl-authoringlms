package com.ims.student.service.impl;

import com.ims.student.client.AcademicClient;
import com.ims.student.client.FinanceClient;
import com.ims.student.dto.ImsStudentEnrollmentsDto;
import com.ims.student.dto.StudentAcademicHistoryDto;
import com.ims.student.dto.StudentSummaryDto;
import com.ims.student.dto.BulkPromotionDto;
import com.ims.student.entity.ImsStudentEnrollments;
import com.ims.student.entity.ImsStudents;
import com.ims.student.exception.ResourceAlreadyExistException;
import com.ims.student.exception.ResourceNotFoundException;
import com.ims.student.repo.ImsStudentEnrollmentsRepo;
import com.ims.student.repo.ImsStudentsRepo;
import com.ims.student.service.ImsStudentEnrollmentsService;
import com.ims.student.util.ApiResponse;
import com.ims.student.dto.external.ImsOfferingsDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ImsStudentEnrollmentsServiceImpl implements ImsStudentEnrollmentsService {

    private final ImsStudentEnrollmentsRepo repo;
    private final ImsStudentsRepo studentsRepo;
    private final AcademicClient academicClient;
    private final FinanceClient financeClient;
    private final ModelMapper modelMapper;

    private ImsStudentEnrollmentsDto toDto(ImsStudentEnrollments e) {
        return modelMapper.map(e, ImsStudentEnrollmentsDto.class);
    }

    private ImsStudentEnrollments toEntity(ImsStudentEnrollmentsDto dto) {
        return modelMapper.map(dto, ImsStudentEnrollments.class);
    }

    @Override
    @Transactional
    public ImsStudentEnrollmentsDto create(ImsStudentEnrollmentsDto dto) {
        ImsStudents student = studentsRepo.findById(dto.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student ID", dto.getStudentId()));

        String tenantId = student.getTenantId();
        dto.setTenantId(tenantId);

        validateOffering(dto.getOfferingId());

        if (dto.getSectionId() != null && !dto.getSectionId().isEmpty()) {
            validateSection(dto.getSectionId());
        }

        if (repo.existsByStudentIdAndOfferingIdAndStatusAndTenantId(dto.getStudentId(), dto.getOfferingId(), "ACTIVE",
                tenantId)) {
            throw new ResourceAlreadyExistException(dto.getStudentId() + " in " + dto.getOfferingId(), "ENROLLMENT",
                    "Active Enrollment");
        }

        if (dto.getStatus() == null) {
            dto.setStatus("ACTIVE");
        }

        ImsStudentEnrollments saved = repo.save(toEntity(dto));
        return toDto(saved);
    }

    private void validateOffering(String offeringId) {
        try {
            ApiResponse<ImsOfferingsDto> offeringResponse = academicClient.getOfferingById(offeringId);
            if (offeringResponse == null || !"SUCCESS".equals(offeringResponse.getStatus())
                    || offeringResponse.getApiData() == null) {
                throw new ResourceNotFoundException("Offering ID", offeringId);
            }
            // Optional: Check status (ENROLLMENT_OPEN or ACTIVE)
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid Offering ID or Academic Service unavailable: " + offeringId);
        }
    }

    private void validateSection(String sectionId) {
        try {
            ApiResponse<com.ims.student.dto.external.ImsSectionsDto> sectionResponse = academicClient.getSectionById(sectionId);
            if (sectionResponse == null || !"SUCCESS".equals(sectionResponse.getStatus())
                    || sectionResponse.getApiData() == null) {
                throw new ResourceNotFoundException("Section ID", sectionId);
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid Section ID: " + sectionId);
        }
    }

    @Override
    @Transactional
    public void bulkPromote(BulkPromotionDto dto, String tenantId) {
        log.info("Starting bulk promotion/transition for {} students to offering {}", dto.getStudentIds().size(), dto.getTargetOfferingId());
        
        validateOffering(dto.getTargetOfferingId());

        for (String studentId : dto.getStudentIds()) {
            Optional<ImsStudentEnrollments> currentOpt = repo.findByStudentIdAndStatusAndTenantId(studentId, "ACTIVE", tenantId);
            
            String sourceYear = "UNKNOWN";
            if (currentOpt.isPresent()) {
                ImsStudentEnrollments active = currentOpt.get();
                sourceYear = active.getAcademicYear();
                
                // 1. Close current enrollment
                active.setStatus("COMPLETED");
                active.setResultStatus("PASS"); // Snapshotting
                repo.save(active);
            }

            // 2. Create new enrollment
            ImsStudentEnrollments next = ImsStudentEnrollments.builder()
                    .studentId(studentId)
                    .offeringId(dto.getTargetOfferingId())
                    .academicYear(dto.getTargetAcademicYear())
                    .tenantId(tenantId)
                    .status("ACTIVE")
                    .build();
            
            repo.save(next);

            // 3. Trigger Finance Orchestration (Async or Sync)
            try {
                Map<String, String> financeReq = new HashMap<>();
                financeReq.put("studentId", studentId);
                financeReq.put("targetOfferingId", dto.getTargetOfferingId());
                financeReq.put("targetAcademicYear", dto.getTargetAcademicYear());
                financeReq.put("sourceAcademicYear", sourceYear);
                
                financeClient.triggerPromotionFinance(financeReq);
            } catch (Exception e) {
                log.error("Failed to trigger finance orchestration for student {}: {}", studentId, e.getMessage());
                // In a production system, this should probably be queued/retried
            }
        }
    }

    @Override
    public ImsStudentEnrollmentsDto update(String id, ImsStudentEnrollmentsDto dto) {
        ImsStudentEnrollments existing = repo.findById(id)
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment ID", id));

        if (dto.getStatus() != null)
            existing.setStatus(dto.getStatus());
        if (dto.getRollNo() != null)
            existing.setRollNo(dto.getRollNo());

        if (dto.getSectionId() != null) {
            if (dto.getSectionId().isEmpty()) {
                existing.setSectionId(null);
            } else {
                validateSection(dto.getSectionId());
                existing.setSectionId(dto.getSectionId());
            }
        }

        ImsStudentEnrollments updated = repo.save(existing);
        return toDto(updated);
    }

    @Override
    public ImsStudentEnrollmentsDto getById(String id) {
        return repo.findById(id)
                .filter(e -> !e.isDeleted())
                .map(this::toDto)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment ID", id));
    }

    @Override
    public List<ImsStudentEnrollmentsDto> getByStudentId(String studentId) {
        return repo.findByStudentId(studentId)
                .stream()
                .filter(e -> !e.isDeleted())
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImsStudentEnrollmentsDto> getAll() {
        return repo.findAll().stream()
                .filter(e -> !e.isDeleted())
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void delete(String id) {
        ImsStudentEnrollments existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment ID", id));

        existing.setDeleted(true);
        existing.setStatus("WITHDRAWN");
        repo.save(existing);
    }

    @Override
    public Page<StudentSummaryDto> getStudentsByOffering(String offeringId, String status, String tenantId,
            Pageable pageable) {
        Page<ImsStudentEnrollments> enrollmentsPage = repo.findByOfferingIdAndStatusAndTenantId(offeringId, status,
                tenantId, pageable);

        if (enrollmentsPage.isEmpty()) {
            return Page.empty(pageable);
        }

        List<String> studentIds = enrollmentsPage.getContent().stream()
                .map(ImsStudentEnrollments::getStudentId)
                .collect(Collectors.toList());

        Map<String, ImsStudents> studentsMap = studentsRepo.findAllById(studentIds).stream()
                .collect(Collectors.toMap(ImsStudents::getId, s -> s));

        List<StudentSummaryDto> summaries = enrollmentsPage.getContent().stream()
                .map(enrollment -> {
                    ImsStudents student = studentsMap.get(enrollment.getStudentId());
                    if (student == null)
                        return null;

                    return StudentSummaryDto.builder()
                            .studentId(student.getId())
                            .enrollmentId(enrollment.getId())
                            .name(student.getFirstName() + " " + student.getLastName())
                            .admissionNo(student.getAdmissionNo())
                            .rollNo(enrollment.getRollNo())
                            .enrollmentStatus(enrollment.getStatus())
                            .avatarUrl(student.getProfileImageUrl())
                            .email(student.getEmail())
                            .phone(student.getPhone())
                            .build();
                })
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());

        return new PageImpl<>(summaries, pageable, enrollmentsPage.getTotalElements());
    }

    @Override
    public List<StudentAcademicHistoryDto> getAcademicHistory(String studentId) {
        List<ImsStudentEnrollments> enrollments = repo.findByStudentId(studentId);
        if (enrollments.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        List<String> offeringIds = enrollments.stream()
                .map(ImsStudentEnrollments::getOfferingId)
                .distinct()
                .collect(Collectors.toList());

        Map<String, ImsOfferingsDto> offeringsMap = new java.util.HashMap<>();
        try {
            ApiResponse<List<ImsOfferingsDto>> response = academicClient.getOfferingsByIds(offeringIds);
            if (response != null && "SUCCESS".equals(response.getStatus()) && response.getApiData() != null) {
                offeringsMap = response.getApiData().stream()
                        .collect(Collectors.toMap(ImsOfferingsDto::getId, Function.identity()));
            }
        } catch (Exception e) {}

        final Map<String, ImsOfferingsDto> finalOfferingsMap = offeringsMap;
        return enrollments.stream()
                .map(e -> {
                    ImsOfferingsDto offering = finalOfferingsMap.get(e.getOfferingId());
                    return StudentAcademicHistoryDto.builder()
                            .enrollmentId(e.getId())
                            .offeringId(e.getOfferingId())
                            .offeringName(offering != null ? offering.getName() : "Unknown Offering")
                            .academicYear(e.getAcademicYear())
                            .status(e.getStatus())
                            .startDate(offering != null ? offering.getStartDate() : null)
                            .endDate(offering != null ? offering.getEndDate() : null)
                            .build();
                })
                .sorted((a, b) -> {
                    int yearCompare = b.getAcademicYear().compareTo(a.getAcademicYear());
                    if (yearCompare != 0)
                        return yearCompare;
                    if (a.getStartDate() != null && b.getStartDate() != null) {
                        return b.getStartDate().compareTo(a.getStartDate());
                    }
                    return 0;
                })
                .collect(Collectors.toList());
    }

    @Override
    public java.util.List<java.util.Map<String, Object>> getOfferingStats(String tenantId) {
        return repo.countByOffering(tenantId);
    }
}