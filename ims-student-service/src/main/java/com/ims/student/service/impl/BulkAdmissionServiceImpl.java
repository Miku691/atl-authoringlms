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
    private final ImsGuardiansServiceImpl guardiansService;
    private final ImsStudentGuardianMappingRepo mappingRepo;
    private final ImsStudentEnrollmentsRepo enrollmentsRepo;

    @Transactional
    public void processBulkAdmission(List<BulkAdmissionDto> students, String tenantId) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (BulkAdmissionDto dto : students) {
            // 1. Create Student
            ImsStudents student = ImsStudents.builder()
                    .tenantId(tenantId)
                    .firstName(dto.getFirstName())
                    .lastName(dto.getLastName())
                    .email(dto.getEmail())
                    .phone(dto.getPhone())
                    .gender(dto.getGender())
                    .dob(dto.getDob() != null ? LocalDate.parse(dto.getDob(), formatter) : null)
                    .admissionNo(dto.getAdmissionNo())
                    .admissionDate(LocalDate.now())
                    .status("ACTIVE")
                    .build();

            student = studentsRepo.save(student);

            // 2. Handle Guardians
            if (dto.getGuardians() != null) {
                for (ImsGuardiansDto guardianDto : dto.getGuardians()) {
                    ImsGuardians guardian = guardiansService.getOrCreate(guardianDto);

                    ImsStudentGuardianMapping mapping = ImsStudentGuardianMapping.builder()
                            .student(student)
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
                        .studentId(student.getId())
                        .offeringId(dto.getOfferingId())
                        .status("ACTIVE")
                        // .academicYear() // TODO: Fetch from offering if needed
                        .build();

                enrollmentsRepo.save(enrollment);
            }
        }
    }
}
