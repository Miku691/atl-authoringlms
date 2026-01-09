package com.ims.student.service.impl;

import com.ims.student.client.AcademicClient;
import com.ims.student.dto.ImsStudentEnrollmentsDto;
import com.ims.student.dto.StudentAcademicHistoryDto;
import com.ims.student.dto.StudentSummaryDto;
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
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsStudentEnrollmentsServiceImpl implements ImsStudentEnrollmentsService {

    private final ImsStudentEnrollmentsRepo repo;
    private final ImsStudentsRepo studentsRepo;
    private final AcademicClient academicClient;
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
        // 1. Validate Student Exists
        if (!studentsRepo.existsById(dto.getStudentId())) {
            throw new ResourceNotFoundException("Student ID", dto.getStudentId());
        }

        // 2. Validate Offering via Client
        try {
            com.ims.student.util.ApiResponse<com.ims.student.dto.external.ImsOfferingsDto> offeringResponse = academicClient
                    .getOfferingById(dto.getOfferingId());
            if (offeringResponse == null || !"SUCCESS".equals(offeringResponse.getStatus())
                    || offeringResponse.getApiData() == null) {
                throw new ResourceNotFoundException("Offering ID", dto.getOfferingId());
            }

            // Check Status
            if (!"ACTIVE".equalsIgnoreCase(offeringResponse.getApiData().getStatus())) {
                throw new IllegalArgumentException("Cannot enroll in INACTIVE or UPCOMING offering");
            }

        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException(
                    "Invalid Offering ID or Academic Service unavailable: " + dto.getOfferingId() + " Error: "
                            + e.getMessage());
        }

        // 3. Check for Duplicate Active Enrollment
        if (repo.existsByStudentIdAndOfferingIdAndStatus(dto.getStudentId(), dto.getOfferingId(), "ACTIVE")) {
            throw new ResourceAlreadyExistException(dto.getStudentId() + " in " + dto.getOfferingId(), "ENROLLMENT",
                    "Active Enrollment");
        }

        // 4. Default Defaults
        if (dto.getStatus() == null) {
            dto.setStatus("ACTIVE");
        }

        ImsStudentEnrollments saved = repo.save(toEntity(dto));
        return toDto(saved);
    }

    @Override
    public ImsStudentEnrollmentsDto update(String id, ImsStudentEnrollmentsDto dto) {
        ImsStudentEnrollments existing = repo.findById(id)
                .filter(e -> !e.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment ID", id));

        // Allow updating status (e.g., WITHDRAWN, COMPLETED) and Roll No
        if (dto.getStatus() != null)
            existing.setStatus(dto.getStatus());
        if (dto.getRollNo() != null)
            existing.setRollNo(dto.getRollNo());

        // Offering cannot be changed. Promotion = New Enrollment.

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
        existing.setStatus("WITHDRAWN"); // Soft delete implies withdrawn
        repo.save(existing);
    }

    @Override
    public Page<StudentSummaryDto> getStudentsByOffering(String offeringId, String status, Pageable pageable) {
        // 1. Fetch Enrollments Page
        Page<ImsStudentEnrollments> enrollmentsPage = repo.findByOfferingIdAndStatus(offeringId, status, pageable);

        if (enrollmentsPage.isEmpty()) {
            return Page.empty(pageable);
        }

        // 2. Collect Student IDs
        List<String> studentIds = enrollmentsPage.getContent().stream()
                .map(ImsStudentEnrollments::getStudentId)
                .collect(Collectors.toList());

        // 3. Fetch Students Map
        Map<String, ImsStudents> studentsMap = studentsRepo.findAllById(studentIds).stream()
                .collect(Collectors.toMap(ImsStudents::getId, s -> s));

        // 4. Map to Summary DTO
        List<StudentSummaryDto> summaries = enrollmentsPage.getContent().stream()
                .map(enrollment -> {
                    ImsStudents student = studentsMap.get(enrollment.getStudentId());
                    if (student == null)
                        return null; // Should not happen ideally

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
        // 1. Fetch all enrollments
        List<ImsStudentEnrollments> enrollments = repo.findByStudentId(studentId);
        if (enrollments.isEmpty()) {
            return java.util.Collections.emptyList();
        }

        // 2. Extract Offering IDs
        List<String> offeringIds = enrollments.stream()
                .map(ImsStudentEnrollments::getOfferingId)
                .distinct()
                .collect(Collectors.toList());

        // 3. Bulk Fetch Offerings from Academic Service
        Map<String, ImsOfferingsDto> offeringsMap = new java.util.HashMap<>();
        try {
            ApiResponse<List<ImsOfferingsDto>> response = academicClient.getOfferingsByIds(offeringIds);
            if (response != null && "SUCCESS".equals(response.getStatus()) && response.getApiData() != null) {
                offeringsMap = response.getApiData().stream()
                        .collect(Collectors.toMap(ImsOfferingsDto::getId, Function.identity()));
            }
        } catch (Exception e) {
            // log.warn("Failed to fetch offering details for history", e);
            // We continue with null names if fetch fails
        }

        // 4. Merge and Map
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
                            // .resultStatus(e.getResultStatus()) // TODO: Add to entity if needed
                            .startDate(offering != null ? offering.getStartDate() : null)
                            .endDate(offering != null ? offering.getEndDate() : null)
                            .build();
                })
                .sorted((a, b) -> {
                    // Sort by Academic Year Desc, then Start Date Desc
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
}