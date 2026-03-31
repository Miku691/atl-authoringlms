package com.ims.finance.service.impl;

import com.ims.finance.entity.FeeHead;
import com.ims.finance.entity.StudentFeeRecord;
import com.ims.finance.repository.FeeHeadRepository;
import com.ims.finance.repository.StudentFeeRecordRepository;
import com.ims.finance.service.FiscalClosingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FiscalClosingServiceImpl implements FiscalClosingService {

    private final StudentFeeRecordRepository studentFeeRecordRepository;
    private final FeeHeadRepository feeHeadRepository;
    private final StudentFeeAllocationServiceImpl studentFeeAllocationService;

    @Override
    @Transactional
    public void allocateAndCarryForward(Map<String, String> request, String tenantId) {
        String studentId = request.get("studentId");
        String targetOfferingId = request.get("targetOfferingId");
        String targetAcademicYear = request.get("targetAcademicYear");
        String sourceAcademicYear = request.get("sourceAcademicYear");

        log.info("Processing financial transition for student {} from {} to {}", studentId, sourceAcademicYear, targetAcademicYear);

        // 1. Handle Arrears Carry-Forward
        if (sourceAcademicYear != null && !"UNKNOWN".equals(sourceAcademicYear)) {
            BigDecimal totalBalance = studentFeeRecordRepository.sumBalanceByStudentAndYear(studentId, sourceAcademicYear, tenantId);
            
            if (totalBalance != null && totalBalance.compareTo(BigDecimal.ZERO) > 0) {
                log.info("Found arrears of {} for student {} in year {}", totalBalance, studentId, sourceAcademicYear);
                
                FeeHead arrearsHead = feeHeadRepository.findByTenantIdAndName(tenantId, "Arrears")
                        .orElseGet(() -> {
                            FeeHead newHead = new FeeHead();
                            newHead.setName("Arrears");
                            newHead.setDescription("Previous Year Dues");
                            newHead.setTenantId(tenantId);
                            return feeHeadRepository.save(newHead);
                        });

                // Check if already carried forward to prevent duplicates
                boolean exists = studentFeeRecordRepository.existsByStudentIdAndFeeHeadIdAndOfferingIdAndAcademicYear(
                        studentId, arrearsHead.getId(), targetOfferingId, targetAcademicYear);
                
                if (!exists) {
                    StudentFeeRecord arrearsRecord = new StudentFeeRecord();
                    arrearsRecord.setStudentId(studentId);
                    arrearsRecord.setFeeHeadId(arrearsHead.getId());
                    arrearsRecord.setOfferingId(targetOfferingId);
                    arrearsRecord.setAcademicYear(targetAcademicYear);
                    arrearsRecord.setAmountDue(totalBalance);
                    arrearsRecord.setAmountPaid(BigDecimal.ZERO);
                    arrearsRecord.setBalance(totalBalance);
                    arrearsRecord.setDueDate(LocalDate.now()); // Arrears are due immediately
                    arrearsRecord.setStatus(StudentFeeRecord.FeeStatus.UNPAID);
                    arrearsRecord.setTenantId(tenantId);
                    studentFeeRecordRepository.save(arrearsRecord);
                }
            }
        }

        // 2. Allocate New Fees
        studentFeeAllocationService.allocateFeesToStudentInternal(studentId, targetOfferingId, targetAcademicYear, tenantId);
    }
}
