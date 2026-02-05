package com.ims.finance.service.impl;

import com.ims.finance.client.StudentServiceClient;
import com.ims.finance.dto.FinanceSummaryDTO;
import com.ims.finance.dto.StudentFeeRecordDTO;
import com.ims.finance.entity.StudentFeeRecord;
import com.ims.finance.entity.StudentFeeRecord.FeeStatus;
import com.ims.finance.exception.ResourceNotFoundException;
import com.ims.finance.repository.FeeHeadRepository;
import com.ims.finance.repository.StudentFeeRecordRepository;
import com.ims.finance.service.StudentFeeLedgerService;
import com.ims.finance.util.SecurityUtils;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Implementation of StudentFeeLedgerService.
 */
@Service
public class StudentFeeLedgerServiceImpl implements StudentFeeLedgerService {

    private final StudentFeeRecordRepository studentFeeRecordRepository;
    private final FeeHeadRepository feeHeadRepository;
    private final StudentServiceClient studentServiceClient;
    private final ModelMapper modelMapper;

    public StudentFeeLedgerServiceImpl(StudentFeeRecordRepository studentFeeRecordRepository,
            FeeHeadRepository feeHeadRepository,
            StudentServiceClient studentServiceClient,
            ModelMapper modelMapper) {
        this.studentFeeRecordRepository = studentFeeRecordRepository;
        this.feeHeadRepository = feeHeadRepository;
        this.studentServiceClient = studentServiceClient;
        this.modelMapper = modelMapper;
    }

    @Override
    public List<StudentFeeRecordDTO> getStudentLedger(String studentId) {
        String tenantId = SecurityUtils.getCurrentTenantId();
        return studentFeeRecordRepository.findAllByStudentIdAndTenantId(studentId, tenantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentFeeRecordDTO> getAllLedgerRecords() {
        String tenantId = SecurityUtils.getCurrentTenantId();
        return studentFeeRecordRepository.findAllByTenantId(tenantId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentFeeRecordDTO> getMyLedger() {
        String email = SecurityUtils.getCurrentUserId(); // Gateway sends email
        String tenantId = SecurityUtils.getCurrentTenantId();
        StudentServiceClient.StudentResponse student = studentServiceClient.getStudentByEmail(email, tenantId)
                .getApiData();
        if (student == null) {
            throw new ResourceNotFoundException("Student Profile", email);
        }
        return getStudentLedger(student.getId());
    }

    @Override
    public Map<String, List<StudentFeeRecordDTO>> getWardsLedger() {
        String userId = SecurityUtils.getCurrentUserId();
        List<String> wardIds = studentServiceClient.getWardIdsByGuardianUserId(userId).getApiData();
        if (wardIds == null || wardIds.isEmpty()) {
            return Map.of();
        }
        return wardIds.stream().collect(Collectors.toMap(
                id -> id,
                this::getStudentLedger));
    }

    @Override
    public FinanceSummaryDTO getStudentSummary(String studentId) {
        String tenantId = SecurityUtils.getCurrentTenantId();
        List<StudentFeeRecord> records = studentFeeRecordRepository.findAllByStudentIdAndTenantId(studentId, tenantId);

        BigDecimal totalDue = records.stream()
                .map(StudentFeeRecord::getAmountDue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPaid = records.stream()
                .map(StudentFeeRecord::getAmountPaid)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal balance = records.stream()
                .map(StudentFeeRecord::getBalance)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long pendingInvoices = records.stream()
                .filter(r -> r.getStatus() != FeeStatus.PAID)
                .count();

        return FinanceSummaryDTO.builder()
                .totalDue(totalDue)
                .totalPaid(totalPaid)
                .balance(balance)
                .pendingInvoices((int) pendingInvoices)
                .build();
    }

    private StudentFeeRecordDTO convertToDTO(StudentFeeRecord record) {
        StudentFeeRecordDTO dto = modelMapper.map(record, StudentFeeRecordDTO.class);

        // Fetch FeeHead name for better readability
        feeHeadRepository.findById(record.getFeeHeadId()).ifPresent(fh -> dto.setFeeHeadName(fh.getName()));

        return dto;
    }
}
