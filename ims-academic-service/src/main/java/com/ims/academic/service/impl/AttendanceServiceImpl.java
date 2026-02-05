package com.ims.academic.service.impl;

import com.ims.academic.dto.AttendanceBatchRequestDto;
import com.ims.academic.dto.AttendanceRecordDto;
import com.ims.academic.dto.MessageDto;
import com.ims.academic.entity.ImsAttendanceMaster;
import com.ims.academic.entity.ImsAttendanceRecords;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.ImsAttendanceMasterRepo;
import com.ims.academic.repo.ImsAttendanceRecordsRepo;
import com.ims.academic.service.AttendanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceServiceImpl implements AttendanceService {

    private final ImsAttendanceMasterRepo masterRepo;
    private final ImsAttendanceRecordsRepo recordsRepo;

    @Override
    @Transactional
    public MessageDto markBulkAttendance(String tenantId, AttendanceBatchRequestDto request) {
        log.info("Marking bulk attendance for {}: {}, date: {}",
                request.getPersonType(), request.getOfferingId(), request.getDate());

        ImsAttendanceMaster master;
        String personType = request.getPersonType() != null ? request.getPersonType() : "STUDENT";
        String searchOfferingId = "STAFF".equalsIgnoreCase(personType) ? "STAFF" : request.getOfferingId();

        // 1. Check if Master already exists
        Optional<ImsAttendanceMaster> existingMaster = masterRepo.findByTenantIdAndOfferingIdAndDateAndSubjectId(
                tenantId, searchOfferingId, request.getDate(), request.getSubjectId());

        if (existingMaster.isPresent()) {
            master = existingMaster.get();
            // Clear existing records to replace
            recordsRepo.deleteByAttendanceMaster(master);
        } else {
            // If offeringId is null (Staff), use 'STAFF' to avoid DB NOT NULL error
            String finalOfferingId = request.getOfferingId() != null ? request.getOfferingId() : "STAFF";

            master = ImsAttendanceMaster.builder()
                    .tenantId(tenantId)
                    .offeringId(finalOfferingId)
                    .subjectId(request.getSubjectId())
                    .date(request.getDate())
                    .status("MARKED")
                    .build();
            master = masterRepo.save(master);
        }

        // 2. Create detailed records
        for (AttendanceRecordDto recordDto : request.getRecords()) {
            ImsAttendanceRecords record = ImsAttendanceRecords.builder()
                    .attendanceMaster(master)
                    .tenantId(tenantId)
                    .personId(recordDto.getPersonId())
                    .personName(recordDto.getPersonName()) // Save name persistently
                    .personType(personType)
                    .status(recordDto.getStatus())
                    .remarks(recordDto.getRemarks())
                    .build();
            recordsRepo.save(record);
        }

        return new MessageDto("Attendance marked successfully", "SUCCESS");
    }

    @Override
    public List<AttendanceRecordDto> getAttendanceByOfferingAndDate(String offeringId, LocalDate date) {
        Optional<ImsAttendanceMaster> master = masterRepo.findByOfferingIdAndDate(offeringId, date)
                .stream().findFirst();

        if (master.isEmpty())
            return List.of();

        return recordsRepo.findByAttendanceMasterId(master.get().getId()).stream()
                .map(r -> mapToDto(master.get(), r))
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceRecordDto> getAttendanceByTenantAndDate(String tenantId, LocalDate date) {
        Optional<ImsAttendanceMaster> master = masterRepo.findByTenantIdAndOfferingIdAndDateAndSubjectId(
                tenantId, "STAFF", date, null);

        if (master.isEmpty())
            return List.of();

        return recordsRepo.findByAttendanceMasterId(master.get().getId()).stream()
                .map(r -> mapToDto(master.get(), r))
                .collect(Collectors.toList());
    }

    @Override
    public List<AttendanceRecordDto> getStudentAttendance(String studentId) {
        return recordsRepo.findByPersonIdAndPersonType(studentId, "STUDENT").stream()
                .map(r -> mapToDto(r.getAttendanceMaster(), r))
                .collect(Collectors.toList());
    }

    @Override
    public com.ims.academic.dto.AttendanceSummaryDto getMonthlyStats(String personId, String personType, int month,
            int year) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.withDayOfMonth(start.lengthOfMonth());

        List<ImsAttendanceRecords> records = recordsRepo.findByPersonIdAndPersonTypeAndAttendanceMasterDateBetween(
                personId, personType, start, end);

        long total = records.size();
        long present = records.stream().filter(r -> r.getStatus() == com.ims.academic.enums.AttendanceStatus.PRESENT)
                .count();
        long absent = records.stream().filter(r -> r.getStatus() == com.ims.academic.enums.AttendanceStatus.ABSENT)
                .count();
        long leave = records.stream().filter(r -> r.getStatus() == com.ims.academic.enums.AttendanceStatus.LEAVE)
                .count();
        long late = records.stream().filter(r -> r.getStatus() == com.ims.academic.enums.AttendanceStatus.LATE).count();

        double percentage = total > 0 ? (double) present / total * 100 : 0;

        return com.ims.academic.dto.AttendanceSummaryDto.builder()
                .totalDays(total)
                .presentDays(present)
                .absentDays(absent)
                .leaveDays(leave)
                .lateDays(late)
                .attendancePercentage(percentage)
                .build();
    }

    @Override
    @Transactional
    public MessageDto updateIndividualRecord(String tenantId, String id, AttendanceRecordDto recordDto) {
        ImsAttendanceRecords record = recordsRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance Record", id));

        if (!record.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access Denied");
        }

        record.setStatus(recordDto.getStatus());
        record.setRemarks(recordDto.getRemarks());
        recordsRepo.save(record);

        return new MessageDto("Attendance updated successfully", "SUCCESS");
    }

    private AttendanceRecordDto mapToDto(ImsAttendanceMaster master, ImsAttendanceRecords record) {
        return AttendanceRecordDto.builder()
                .id(record.getId())
                .personId(record.getPersonId())
                .personName(record.getPersonName()) // Use persistent name
                .personType(record.getPersonType())
                .offeringId(master.getOfferingId())
                .subjectId(master.getSubjectId())
                .date(master.getDate())
                .status(record.getStatus())
                .remarks(record.getRemarks())
                .build();
    }
}
