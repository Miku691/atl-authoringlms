package com.ims.academic.scheduler;

import com.ims.academic.client.AuthClient;
import com.ims.academic.client.NotificationClient;
import com.ims.academic.client.StudentClient;
import com.ims.academic.dto.external.EmailRequestDto;
import com.ims.academic.dto.external.ImsStudentGuardiansDto;
import com.ims.academic.dto.external.ImsStudentsDto;
import com.ims.academic.entity.ImsAttendanceRecords;
import com.ims.academic.enums.AttendanceStatus;
import com.ims.academic.repo.ImsAttendanceRecordsRepo;
import com.ims.academic.util.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class AttendanceScheduledTasks {

    private final ImsAttendanceRecordsRepo recordsRepo;
    private final AuthClient authClient;
    private final StudentClient studentClient;
    private final NotificationClient notificationClient;

    /**
     * Daily summary for Schools and Colleges.
     * Runs every day at 18:00 (6 PM).
     */
    @Scheduled(cron = "0 0 18 * * ?")
    public void sendDailyAbsenceSummaries() {
        log.info("Starting daily absence summary job...");
        LocalDate today = LocalDate.now();

        // 1. Get all ABSENT records for today
        List<ImsAttendanceRecords> absentees = recordsRepo.findByStatusAndAttendanceMasterDate(AttendanceStatus.ABSENT, today);
        if (absentees.isEmpty()) return;

        // 2. Group by Tenant
        Map<String, List<ImsAttendanceRecords>> byTenant = absentees.stream()
                .collect(Collectors.groupingBy(ImsAttendanceRecords::getTenantId));

        for (Map.Entry<String, List<ImsAttendanceRecords>> entry : byTenant.entrySet()) {
            String tenantId = entry.getKey();
            List<ImsAttendanceRecords> tenantRecords = entry.getValue();

            // 3. Skip if COACHING (they get instant alerts)
            try {
                ApiResponse<AuthClient.TenantDetailDto> tenantRes = authClient.getTenantById(tenantId);
                if (tenantRes == null || tenantRes.getApiData() == null || "COACHING".equalsIgnoreCase(tenantRes.getApiData().getType())) {
                    continue;
                }

                // 4. Send summaries for each unique student in this tenant
                Map<String, List<ImsAttendanceRecords>> byStudent = tenantRecords.stream()
                        .collect(Collectors.groupingBy(ImsAttendanceRecords::getPersonId));

                for (String studentId : byStudent.keySet()) {
                    sendDailySummaryToStudent(tenantId, studentId, today);
                }
            } catch (Exception e) {
                log.error("Failed to process daily summary for tenant: {}", tenantId, e);
            }
        }
    }

    private void sendDailySummaryToStudent(String tenantId, String studentId, LocalDate date) {
        try {
            ApiResponse<ImsStudentsDto> studentRes = studentClient.getStudentById(studentId);
            if (studentRes == null || studentRes.getApiData() == null) return;
            ImsStudentsDto student = studentRes.getApiData();

            ApiResponse<List<ImsStudentGuardiansDto>> guardianRes = studentClient.getGuardiansByStudentId(studentId);
            Optional<ImsStudentGuardiansDto> primaryGuardian = guardianRes != null && guardianRes.getApiData() != null
                    ? guardianRes.getApiData().stream().filter(ImsStudentGuardiansDto::isPrimary).findFirst()
                    : Optional.empty();

            String subject = "Daily Attendance Summary: " + student.getFirstName() + " " + student.getLastName();
            String body = String.format(
                "Greetings,\n\n" +
                "This is a daily summary notification regarding the absence of %s %s on %s.\n" +
                "Our records indicate that the student was absent for one or more sessions today.\n\n" +
                "Please ensure this absence is noted. If you have any questions, please contact the administration.\n\n" +
                "Regards,\nInstitute Management System",
                student.getFirstName(), student.getLastName(), date.toString()
            );

            List<String> recipients = new ArrayList<>();
            if (student.getEmail() != null) recipients.add(student.getEmail());
            if (primaryGuardian.isPresent() && primaryGuardian.get().getGuardianEmail() != null) {
                recipients.add(primaryGuardian.get().getGuardianEmail());
            }

            for (String to : recipients) {
                notificationClient.sendEmail(EmailRequestDto.builder()
                        .to(to)
                        .subject(subject)
                        .body(body)
                        .tenantId(tenantId)
                        .build());
            }
        } catch (Exception e) {
            log.error("Failed to send daily summary for student: {} in tenant: {}", studentId, tenantId, e);
        }
    }
}
