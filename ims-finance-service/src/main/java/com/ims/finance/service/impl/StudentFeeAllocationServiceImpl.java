package com.ims.finance.service.impl;

import com.ims.finance.entity.FeeStructure;
import com.ims.finance.entity.StudentFeeRecord;
import com.ims.finance.repository.FeeStructureRepository;
import com.ims.finance.repository.StudentFeeRecordRepository;
import com.ims.finance.service.StudentFeeAllocationService;
import com.ims.finance.util.SecurityUtils;
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

    public StudentFeeAllocationServiceImpl(FeeStructureRepository feeStructureRepository,
            StudentFeeRecordRepository studentFeeRecordRepository) {
        this.feeStructureRepository = feeStructureRepository;
        this.studentFeeRecordRepository = studentFeeRecordRepository;
    }

    @Override
    @Transactional
    public void allocateFeesToStudent(String studentId, String offeringId, String academicYear) {
        String tenantId = SecurityUtils.getCurrentTenantId();

        // Find all fee structures for this offering and tenant
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
                record.setAmountDue(structure.getAmount());
                record.setAmountPaid(BigDecimal.ZERO);
                record.setBalance(structure.getAmount());
                record.setDueDate(LocalDate.now().plusMonths(1)); // Default due date: 1 month from now
                record.setStatus(StudentFeeRecord.FeeStatus.UNPAID);
                record.setTenantId(tenantId);
                studentFeeRecordRepository.save(record);
            }
        }
    }
}
