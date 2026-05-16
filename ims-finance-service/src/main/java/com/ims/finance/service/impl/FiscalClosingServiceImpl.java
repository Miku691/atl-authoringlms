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
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FiscalClosingServiceImpl implements FiscalClosingService {

    private final StudentFeeRecordRepository studentFeeRecordRepository;
    private final FeeHeadRepository feeHeadRepository;
    private final StudentFeeAllocationServiceImpl studentFeeAllocationService;
    private final com.ims.finance.client.OfferingServiceClient offeringServiceClient;

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

    @Override
    @Transactional
    public void bulkAllocateAndCarryForward(List<Map<String, String>> requests, String tenantId) {
        if (requests == null || requests.isEmpty()) return;

        log.info("Processing bulk financial transition for {} requests in tenant {}", requests.size(), tenantId);

        // Pre-fetch Arrears Head
        FeeHead arrearsHead = feeHeadRepository.findByTenantIdAndName(tenantId, "Arrears")
                .orElseGet(() -> {
                    FeeHead newHead = new FeeHead();
                    newHead.setName("Arrears");
                    newHead.setDescription("Previous Year Dues");
                    newHead.setTenantId(tenantId);
                    return feeHeadRepository.save(newHead);
                });

        // Optimization: Cache offering data per targetOfferingId
        Map<String, com.ims.finance.client.OfferingServiceClient.OfferingResponse> offeringCache = new java.util.HashMap<>();

        for (Map<String, String> request : requests) {
            String studentId = request.get("studentId");
            String targetOfferingId = request.get("targetOfferingId");
            String targetAcademicYear = request.get("targetAcademicYear");
            String sourceAcademicYear = request.get("sourceAcademicYear");

            // 1. Handle Arrears Carry-Forward
            if (sourceAcademicYear != null && !"UNKNOWN".equals(sourceAcademicYear)) {
                BigDecimal totalBalance = studentFeeRecordRepository.sumBalanceByStudentAndYear(studentId, sourceAcademicYear, tenantId);
                if (totalBalance != null && totalBalance.compareTo(BigDecimal.ZERO) > 0) {
                    if (!studentFeeRecordRepository.existsByStudentIdAndFeeHeadIdAndOfferingIdAndAcademicYear(
                            studentId, arrearsHead.getId(), targetOfferingId, targetAcademicYear)) {
                        
                        StudentFeeRecord arrearsRecord = new StudentFeeRecord();
                        arrearsRecord.setStudentId(studentId);
                        arrearsRecord.setFeeHeadId(arrearsHead.getId());
                        arrearsRecord.setOfferingId(targetOfferingId);
                        arrearsRecord.setAcademicYear(targetAcademicYear);
                        arrearsRecord.setAmountDue(totalBalance);
                        arrearsRecord.setAmountPaid(BigDecimal.ZERO);
                        arrearsRecord.setBalance(totalBalance);
                        arrearsRecord.setDueDate(LocalDate.now());
                        arrearsRecord.setStatus(StudentFeeRecord.FeeStatus.UNPAID);
                        arrearsRecord.setTenantId(tenantId);
                        studentFeeRecordRepository.save(arrearsRecord);
                    }
                }
            }

            // 2. Allocate New Fees (Using Cache)
            com.ims.finance.client.OfferingServiceClient.OfferingResponse offeringData = offeringCache.computeIfAbsent(targetOfferingId, id -> {
                var resp = offeringServiceClient.getOfferingById(id);
                return (resp != null && "SUCCESS".equals(resp.getStatus())) ? resp.getApiData() : null;
            });

            studentFeeAllocationService.allocateFeesToStudentInternal(studentId, targetOfferingId, targetAcademicYear, tenantId, offeringData);
        }
    }
}
