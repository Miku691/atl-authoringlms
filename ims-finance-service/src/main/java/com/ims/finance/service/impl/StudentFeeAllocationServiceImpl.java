package com.ims.finance.service.impl;

import com.ims.finance.entity.FeeInstallmentPlan;
import com.ims.finance.entity.FeeInstallmentSchedule;
import com.ims.finance.repository.FeeInstallmentPlanRepository;
import com.ims.finance.repository.FeeInstallmentScheduleRepository;
import com.ims.finance.entity.FeeStructure;
import com.ims.finance.entity.StudentFeeRecord;
import com.ims.finance.entity.FeeDiscount;
import com.ims.finance.entity.StudentFeeConcession;
import com.ims.finance.repository.FeeDiscountRepository;
import com.ims.finance.repository.StudentFeeConcessionRepository;
import com.ims.finance.repository.FeeStructureRepository;
import com.ims.finance.repository.StudentFeeRecordRepository;
import com.ims.finance.service.StudentFeeAllocationService;
import com.ims.finance.util.SecurityUtils;
import com.ims.finance.client.StudentServiceClient;
import com.ims.finance.util.ApiResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * Implementation of StudentFeeAllocationService.
 */
@Service
public class StudentFeeAllocationServiceImpl implements StudentFeeAllocationService {

    private final FeeStructureRepository feeStructureRepository;
    private final StudentFeeRecordRepository studentFeeRecordRepository;
    private final StudentServiceClient studentServiceClient;
    private final FeeInstallmentPlanRepository planRepository;
    private final FeeInstallmentScheduleRepository scheduleRepository;
    private final StudentFeeConcessionRepository concessionRepository;
    private final FeeDiscountRepository feeDiscountRepository;

    public StudentFeeAllocationServiceImpl(FeeStructureRepository feeStructureRepository,
            StudentFeeRecordRepository studentFeeRecordRepository,
            StudentServiceClient studentServiceClient,
            FeeInstallmentPlanRepository planRepository,
            FeeInstallmentScheduleRepository scheduleRepository,
            StudentFeeConcessionRepository concessionRepository,
            FeeDiscountRepository feeDiscountRepository) {
        this.feeStructureRepository = feeStructureRepository;
        this.studentFeeRecordRepository = studentFeeRecordRepository;
        this.studentServiceClient = studentServiceClient;
        this.planRepository = planRepository;
        this.scheduleRepository = scheduleRepository;
        this.concessionRepository = concessionRepository;
        this.feeDiscountRepository = feeDiscountRepository;
    }

    @Override
    @Transactional
    public void allocateFeesToStudent(String studentId, String offeringId, String academicYear) {
        String tenantId = SecurityUtils.getCurrentTenantId();

        // 1. Check for installment plans first
        List<FeeInstallmentPlan> plans = planRepository.findByOfferingIdAndTenantId(offeringId, tenantId);
        // We assume there's one active plan per offering/academic year.
        FeeInstallmentPlan activePlan = plans.stream()
                .filter(p -> p.getAcademicYear().equals(academicYear))
                .findFirst()
                .orElse(null);

        // Fetch student concessions for this academic year
        List<StudentFeeConcession> concessions = concessionRepository.findByStudentIdAndAcademicYearAndTenantId(studentId, academicYear, tenantId).stream()
                .filter(c -> "ACTIVE".equalsIgnoreCase(c.getStatus()))
                .toList();

        if (activePlan != null) {
            // Allocate per Installment Schedule
            List<FeeInstallmentSchedule> schedules = scheduleRepository.findByPlanIdAndTenantIdOrderByInstallmentNumberAsc(activePlan.getId(), tenantId);
            for (FeeInstallmentSchedule schedule : schedules) {
                boolean exists = studentFeeRecordRepository.existsByStudentIdAndInstallmentScheduleId(studentId, schedule.getId());
                if (!exists) {
                    StudentFeeRecord record = new StudentFeeRecord();
                    record.setStudentId(studentId);
                    record.setFeeHeadId(schedule.getFeeHeadId());
                    record.setOfferingId(offeringId);
                    record.setAcademicYear(academicYear);

                    // Calculate customized amount due
                    BigDecimal originalAmount = schedule.getAmount();
                    BigDecimal finalAmount = calculateDiscountedAmount(originalAmount, schedule.getFeeHeadId(), concessions);

                    record.setAmountDue(finalAmount);
                    record.setAmountPaid(BigDecimal.ZERO);
                    record.setBalance(finalAmount);
                    record.setDueDate(schedule.getDueDate());
                    record.setStatus(StudentFeeRecord.FeeStatus.UNPAID);
                    record.setTenantId(tenantId);
                    record.setInstallmentScheduleId(schedule.getId());
                    studentFeeRecordRepository.save(record);
                }
            }
        } else {
            // 2. Fallback to old behavior (lump sum)
            List<FeeStructure> structures = feeStructureRepository.findAllByOfferingIdAndTenantId(offeringId, tenantId);

            for (FeeStructure structure : structures) {
                // Check if record already exists to prevent duplicates
                boolean exists = studentFeeRecordRepository.existsByStudentIdAndFeeHeadIdAndOfferingIdAndAcademicYear(
                        studentId, structure.getFeeHeadId(), offeringId, academicYear);

                if (!exists) {
                    StudentFeeRecord record = new StudentFeeRecord();
                    record.setStudentId(studentId);
                    record.setFeeHeadId(structure.getFeeHeadId());
                    record.setOfferingId(offeringId);
                    record.setAcademicYear(academicYear);

                    BigDecimal originalAmount = structure.getAmount();
                    BigDecimal finalAmount = calculateDiscountedAmount(originalAmount, structure.getFeeHeadId(), concessions);

                    record.setAmountDue(finalAmount);
                    record.setAmountPaid(BigDecimal.ZERO);
                    record.setBalance(finalAmount);
                    record.setDueDate(LocalDate.now().plusMonths(1)); // Default due date: 1 month from now
                    record.setStatus(StudentFeeRecord.FeeStatus.UNPAID);
                    record.setTenantId(tenantId);
                    studentFeeRecordRepository.save(record);
                }
            }
        }
    }

    @Override
    @Transactional
    public void bulkAllocateFees(String offeringId, String academicYear) {
        String tenantId = SecurityUtils.getCurrentTenantId();

        // 1. Fetch all students in the offering via Feign
        ApiResponse<List<StudentServiceClient.StudentResponse>> response = studentServiceClient.getStudentsByOffering(offeringId, tenantId);

        if (response != null && "SUCCESS".equalsIgnoreCase(response.getStatus()) && response.getApiData() != null) {
            List<StudentServiceClient.StudentResponse> students = response.getApiData();

            // 2. Allocate fees for each student
            for (StudentServiceClient.StudentResponse student : students) {
                allocateFeesToStudent(student.getId(), offeringId, academicYear);
            }
        }
    }

    private BigDecimal calculateDiscountedAmount(BigDecimal originalAmount, String feeHeadId, List<StudentFeeConcession> concessions) {
        BigDecimal finalAmount = originalAmount;

        for (StudentFeeConcession concession : concessions) {
            feeDiscountRepository.findById(concession.getFeeDiscountId()).ifPresent(discount -> {
                // Check if this discount applies to this fee head
                boolean applies = discount.getApplicableFeeHeadIds() == null || 
                                  discount.getApplicableFeeHeadIds().isEmpty() || 
                                  discount.getApplicableFeeHeadIds().contains(feeHeadId);

                if (applies) {
                    if (discount.getType() == FeeDiscount.DiscountType.FIXED) {
                        finalAmount.subtract(discount.getValue());
                    } else if (discount.getType() == FeeDiscount.DiscountType.PERCENTAGE) {
                        BigDecimal discountAmount = finalAmount.multiply(discount.getValue()).divide(BigDecimal.valueOf(100));
                        finalAmount.subtract(discountAmount);
                    }
                }
            });
        }
        
        return finalAmount.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : finalAmount;
    }
}
