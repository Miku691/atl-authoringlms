package com.ims.finance.job;

import com.ims.finance.entity.FeeInstallmentSchedule;
import com.ims.finance.entity.LateFeeRule;
import com.ims.finance.entity.StudentFeeRecord;
import com.ims.finance.repository.FeeInstallmentScheduleRepository;
import com.ims.finance.repository.LateFeeRuleRepository;
import com.ims.finance.repository.StudentFeeRecordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class LateFeeCalculationJob {

    private final StudentFeeRecordRepository feeRecordRepository;
    private final FeeInstallmentScheduleRepository scheduleRepository;
    private final LateFeeRuleRepository lateFeeRuleRepository;

    // Run every day at 1:00 AM
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void calculateLateFees() {
        log.info("Starting Daily Late Fee Calculation Job...");

        LocalDate today = LocalDate.now();
        List<StudentFeeRecord.FeeStatus> unpaidStatuses = Arrays.asList(
                StudentFeeRecord.FeeStatus.UNPAID, 
                StudentFeeRecord.FeeStatus.PARTIAL
        );

        List<StudentFeeRecord> overdueRecords = feeRecordRepository
                .findByStatusInAndLateFeeAppliedFalseAndDueDateBefore(unpaidStatuses, today);

        log.info("Found {} potentially overdue fee records.", overdueRecords.size());

        int appliedCount = 0;
        for (StudentFeeRecord record : overdueRecords) {
            String scheduleId = record.getInstallmentScheduleId();
            if (scheduleId == null) {
                continue; // No installment schedule linked, skip
            }

            Optional<FeeInstallmentSchedule> scheduleOpt = scheduleRepository.findById(scheduleId);
            if (scheduleOpt.isEmpty() || scheduleOpt.get().getLateFeeRuleId() == null) {
                continue; // No schedule or no rule attached
            }

            LateFeeRule rule = lateFeeRuleRepository.findById(scheduleOpt.get().getLateFeeRuleId()).orElse(null);
            if (rule == null) {
                continue; // Rule deleted or invalid
            }

            LocalDate deadline = record.getDueDate().plusDays(rule.getGracePeriodDays());
            if (today.isAfter(deadline)) {
                // Apply Late Fee
                BigDecimal penalty = BigDecimal.ZERO;
                if ("FIXED".equalsIgnoreCase(rule.getType())) {
                    penalty = rule.getValue();
                } else if ("PERCENTAGE".equalsIgnoreCase(rule.getType())) {
                    // Penalty is a percentage of the initial amount due
                    penalty = record.getAmountDue().multiply(rule.getValue())
                            .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                }

                if (penalty.compareTo(BigDecimal.ZERO) > 0) {
                    record.setLateFeeAmount(penalty);
                    record.setLateFeeApplied(true);
                    
                    // Add penalty to balance and amountDue
                    record.setAmountDue(record.getAmountDue().add(penalty));
                    record.setBalance(record.getBalance().add(penalty));
                    
                    feeRecordRepository.save(record);
                    appliedCount++;
                    log.debug("Applied late fee of {} to record {}", penalty, record.getId());
                }
            }
        }

        log.info("Late Fee Calculation Job Completed. Late fees applied to {} records.", appliedCount);
    }
}
