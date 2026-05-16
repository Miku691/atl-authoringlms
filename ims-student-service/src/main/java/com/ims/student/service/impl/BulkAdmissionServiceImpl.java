package com.ims.student.service.impl;

import com.ims.student.dto.BulkAdmissionDto;
import com.ims.student.dto.ImsGuardiansDto;
import com.ims.student.entity.ImsGuardians;
import com.ims.student.entity.ImsStudentEnrollments;
import com.ims.student.entity.ImsStudentGuardianMapping;
import com.ims.student.entity.ImsStudents;
import com.ims.student.repo.ImsStudentEnrollmentsRepo;
import com.ims.student.repo.ImsStudentGuardianMappingRepo;
import com.ims.student.repo.ImsStudentsRepo;
import com.ims.student.client.PlatformClient;
import com.ims.student.exception.LimitExceededException;
import com.ims.student.dto.SubscriptionLimitsDto;
import com.ims.student.service.ImsStudentsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BulkAdmissionServiceImpl {

    private final ImsStudentsRepo studentsRepo;
    private final ImsStudentsService studentsService;
    private final ImsGuardiansServiceImpl guardiansService;
    private final ImsStudentGuardianMappingRepo mappingRepo;
    private final ImsStudentEnrollmentsRepo enrollmentsRepo;
    private final PlatformClient platformClient;
    private final org.modelmapper.ModelMapper modelMapper;

    @Transactional
    public void processBulkAdmission(List<BulkAdmissionDto> students, String tenantId) {
        // SaaS Limit Enforcement (Pre-check for the whole batch)
        SubscriptionLimitsDto limits = platformClient.getTenantLimits(tenantId);
        long currentCount = studentsRepo.countByTenantId(tenantId);
        int incomingCount = students.size();

        if (limits != null && limits.getMaxStudents() != null && limits.getMaxStudents() > 0) {
            if (currentCount + incomingCount > limits.getMaxStudents()) {
                throw new LimitExceededException(
                    String.format("Bulk Admission Failed: Your current plan '%s' allows up to %d students. " +
                    "You already have %d and trying to add %d more, which exceeds the limit. Please upgrade.", 
                    limits.getPlanName(), limits.getMaxStudents(), currentCount, incomingCount)
                );
            }
        }

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (BulkAdmissionDto dto : students) {
            // 1. Create Student using the main service to ensure all validations and logic run
            com.ims.student.dto.ImsStudentsDto studentDto = com.ims.student.dto.ImsStudentsDto.builder()
                    .tenantId(tenantId)
                    .firstName(dto.getFirstName())
                    .lastName(dto.getLastName())
                    .email(dto.getEmail())
                    .phone(dto.getPhone())
                    .gender(dto.getGender())
                    .dob(dto.getDob() != null ? LocalDate.parse(dto.getDob(), formatter) : null)
                    .admissionNo(dto.getAdmissionNo())
                    .status("ACTIVE")
                    .build();

            com.ims.student.dto.ImsStudentsDto savedStudentDto = studentsService.create(studentDto);
            ImsStudents savedStudent = modelMapper.map(savedStudentDto, ImsStudents.class);

            // 2. Handle Guardians
            if (dto.getGuardians() != null) {
                for (ImsGuardiansDto guardianDto : dto.getGuardians()) {
                    ImsGuardians guardian = guardiansService.getOrCreate(guardianDto);

                    ImsStudentGuardianMapping mapping = ImsStudentGuardianMapping.builder()
                            .student(savedStudent)
                            .guardian(guardian)
                            .relation(guardianDto.getRelation() != null ? guardianDto.getRelation() : "GUARDIAN")
                            .isPrimary(guardianDto.isPrimary())
                            .build();

                    mappingRepo.save(mapping);
                }
            }

            // 3. Create Enrollment
            if (dto.getOfferingId() != null) {
                ImsStudentEnrollments enrollment = ImsStudentEnrollments.builder()
                        .studentId(savedStudent.getId())
                        .tenantId(tenantId)
                        .offeringId(dto.getOfferingId())
                        .status("ACTIVE")
                        .build();

                enrollmentsRepo.save(enrollment);
            }
        }
    }
}
