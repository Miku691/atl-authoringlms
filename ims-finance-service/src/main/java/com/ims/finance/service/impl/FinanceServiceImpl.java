package com.ims.finance.service.impl;

import com.ims.finance.client.StudentServiceClient;
import com.ims.finance.dto.CollectPaymentDTO;
import com.ims.finance.dto.CollectionSummaryDTO;
import com.ims.finance.dto.RefundDTO;
import com.ims.finance.dto.TransactionDTO;
import com.ims.finance.entity.DemandNote;
import com.ims.finance.entity.Refund;
import com.ims.finance.entity.StudentFeeRecord;
import com.ims.finance.entity.Transaction;
import com.ims.finance.exception.ResourceNotFoundException;
import com.ims.finance.repository.DemandNoteRepository;
import com.ims.finance.repository.RefundRepository;
import com.ims.finance.repository.StudentFeeRecordRepository;
import com.ims.finance.repository.TransactionRepository;
import com.ims.finance.service.FinanceService;
import com.ims.finance.util.SecurityUtils;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Implementation of FinanceService.
 */
@Service
public class FinanceServiceImpl implements FinanceService {

    private final StudentFeeRecordRepository studentFeeRecordRepository;
    private final TransactionRepository transactionRepository;
    private final RefundRepository refundRepository;
    private final DemandNoteRepository demandNoteRepository;
    private final StudentServiceClient studentServiceClient;
    private final ModelMapper modelMapper;

    public FinanceServiceImpl(StudentFeeRecordRepository studentFeeRecordRepository,
            TransactionRepository transactionRepository,
            RefundRepository refundRepository,
            DemandNoteRepository demandNoteRepository,
            StudentServiceClient studentServiceClient,
            ModelMapper modelMapper) {
        this.studentFeeRecordRepository = studentFeeRecordRepository;
        this.transactionRepository = transactionRepository;
        this.refundRepository = refundRepository;
        this.demandNoteRepository = demandNoteRepository;
        this.studentServiceClient = studentServiceClient;
        this.modelMapper = modelMapper;
    }

    @Override
    public CollectionSummaryDTO getCollectionSummary() {
        String tenantId = SecurityUtils.getCurrentTenantId();

        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        LocalDateTime monthStart = LocalDateTime.of(LocalDate.now().withDayOfMonth(1), LocalTime.MIN);
        LocalDateTime yearStart = LocalDateTime.of(LocalDate.now().withDayOfYear(1), LocalTime.MIN);

        BigDecimal today = transactionRepository.sumAmountByTenantIdAndDateAfter(tenantId, todayStart);
        BigDecimal month = transactionRepository.sumAmountByTenantIdAndDateAfter(tenantId, monthStart);
        BigDecimal year = transactionRepository.sumAmountByTenantIdAndDateAfter(tenantId, yearStart);

        List<Object[]> offeringStats = transactionRepository.sumAmountByOffering(tenantId);
        Map<String, BigDecimal> collectionByOffering = new HashMap<>();
        for (Object[] row : offeringStats) {
            collectionByOffering.put((String) row[0], (BigDecimal) row[1]);
        }

        List<TransactionDTO> recent = transactionRepository.findAllByTenantIdOrderByTransactionDateDesc(tenantId)
                .stream()
                .limit(10)
                .map(t -> modelMapper.map(t, TransactionDTO.class))
                .collect(Collectors.toList());

        // Fetch offering names for the dashboard
        Map<String, String> offeringNames = new HashMap<>();
        if (!collectionByOffering.isEmpty()) {
            try {
                // We can fetch names from academic service in bulk if needed, 
                // but for now let's just use the IDs or fetch as needed
                // Ideally, Finance Service should have a cache or names are passed/fetched
            } catch (Exception e) {
                // Ignore
            }
        }

        return CollectionSummaryDTO.builder()
                .todayCollection(today != null ? today : BigDecimal.ZERO)
                .monthCollection(month != null ? month : BigDecimal.ZERO)
                .yearCollection(year != null ? year : BigDecimal.ZERO)
                .collectionByOffering(collectionByOffering)
                .offeringNames(offeringNames)
                .recentTransactions(recent)
                .build();
    }

    @Override
    @Transactional
    public TransactionDTO collectPayment(CollectPaymentDTO collectPaymentDTO) {
        String tenantId = SecurityUtils.getCurrentTenantId();
        String collectedBy = SecurityUtils.getCurrentUserId();

        // 1. Record the Transaction
        Transaction transaction = new Transaction();
        transaction.setStudentId(collectPaymentDTO.getStudentId());
        transaction.setAmount(collectPaymentDTO.getAmount());
        transaction.setPaymentMode(collectPaymentDTO.getPaymentMode());
        transaction.setReferenceNumber(collectPaymentDTO.getReferenceNumber());
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setTenantId(tenantId);
        transaction.setCollectedBy(collectedBy);

        transactionRepository.save(transaction);

        BigDecimal remainingAmount = collectPaymentDTO.getAmount();

        // 2. Prioritize Demand Notes (Invoices)
        List<DemandNote> pendingDemands = demandNoteRepository
                .findAllByStudentIdAndTenantIdAndStatusNotOrderByDueDateAsc(
                        collectPaymentDTO.getStudentId(), tenantId, DemandNote.DemandStatus.PAID);

        for (DemandNote demand : pendingDemands) {
            if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0)
                break;

            BigDecimal balance = demand.getBalance();
            BigDecimal amountToPay = remainingAmount.min(balance);

            remainingAmount = remainingAmount.subtract(amountToPay);
            demand.setAmountPaid(demand.getAmountPaid().add(amountToPay));
            demand.setBalance(demand.getBalance().subtract(amountToPay));

            if (demand.getBalance().compareTo(BigDecimal.ZERO) <= 0) {
                demand.setStatus(DemandNote.DemandStatus.PAID);
            } else {
                demand.setStatus(DemandNote.DemandStatus.PARTIAL);
            }
            demandNoteRepository.save(demand);

            // Important: Reduce structural ledger for the linked Fee Head
            studentFeeRecordRepository
                    .findByStudentIdAndFeeHeadIdAndAcademicYearAndTenantId(
                            collectPaymentDTO.getStudentId(), demand.getFeeHeadId(),
                            demand.getAcademicYear(), tenantId)
                    .ifPresent(record -> {
                        record.setAmountPaid(record.getAmountPaid().add(amountToPay));
                        record.setBalance(record.getBalance().subtract(amountToPay));

                        if (record.getBalance().compareTo(BigDecimal.ZERO) <= 0) {
                            record.setStatus(StudentFeeRecord.FeeStatus.PAID);
                        } else if (record.getAmountPaid().compareTo(BigDecimal.ZERO) > 0) {
                            record.setStatus(StudentFeeRecord.FeeStatus.PARTIAL);
                        }
                        studentFeeRecordRepository.save(record);
                    });
        }

        // 3. General Collection (Remaining amount to structural ledger)
        if (remainingAmount.compareTo(BigDecimal.ZERO) > 0) {
            List<StudentFeeRecord> recordsToPay;

            if (collectPaymentDTO.getFeeRecordIds() != null && !collectPaymentDTO.getFeeRecordIds().isEmpty()) {
                // Pay against specific records
                recordsToPay = studentFeeRecordRepository.findAllById(collectPaymentDTO.getFeeRecordIds());
            } else {
                // FIFO: Pay oldest unpaid records first
                recordsToPay = studentFeeRecordRepository
                        .findAllByStudentIdAndTenantId(collectPaymentDTO.getStudentId(), tenantId)
                        .stream()
                        .filter(r -> r.getStatus() != StudentFeeRecord.FeeStatus.PAID)
                        .sorted(Comparator.comparing(StudentFeeRecord::getDueDate))
                        .collect(Collectors.toList());
            }

            for (StudentFeeRecord record : recordsToPay) {
                if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0)
                    break;

                BigDecimal balance = record.getBalance();
                BigDecimal amountToPay = remainingAmount.min(balance);

                remainingAmount = remainingAmount.subtract(amountToPay);
                record.setAmountPaid(record.getAmountPaid().add(amountToPay));
                record.setBalance(record.getBalance().subtract(amountToPay));
                
                // Set offering context in transaction if not already set
                if (transaction.getOfferingId() == null) {
                    transaction.setOfferingId(record.getOfferingId());
                    transaction.setAcademicYear(record.getAcademicYear());
                    transactionRepository.save(transaction);
                }

                if (record.getBalance().compareTo(BigDecimal.ZERO) <= 0) {
                    record.setStatus(StudentFeeRecord.FeeStatus.PAID);
                } else {
                    record.setStatus(StudentFeeRecord.FeeStatus.PARTIAL);
                }
                studentFeeRecordRepository.save(record);
            }
        }

        return modelMapper.map(transaction, TransactionDTO.class);
    }

    @Override
    public List<TransactionDTO> getStudentTransactions(String studentId) {
        String tenantId = SecurityUtils.getCurrentTenantId();
        return transactionRepository.findAllByStudentIdAndTenantId(studentId, tenantId).stream()
                .map(t -> modelMapper.map(t, TransactionDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public TransactionDTO getTransactionById(String transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("transactionId", transactionId));
        return modelMapper.map(transaction, TransactionDTO.class);
    }

    @Override
    @Transactional
    public RefundDTO processRefund(RefundDTO refundDTO) {
        String tenantId = SecurityUtils.getCurrentTenantId();
        StudentFeeRecord record = studentFeeRecordRepository.findById(refundDTO.getStudentFeeRecordId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("StudentFeeRecord", refundDTO.getStudentFeeRecordId()));

        if (record.getAmountPaid().compareTo(refundDTO.getAmount()) < 0) {
            throw new RuntimeException("Refund amount exceeds paid amount");
        }

        // Update Record
        record.setAmountPaid(record.getAmountPaid().subtract(refundDTO.getAmount()));
        record.setBalance(record.getAmountDue().subtract(record.getAmountPaid()));

        if (record.getAmountPaid().compareTo(BigDecimal.ZERO) == 0) {
            record.setStatus(StudentFeeRecord.FeeStatus.UNPAID);
        } else {
            record.setStatus(StudentFeeRecord.FeeStatus.PARTIAL);
        }

        studentFeeRecordRepository.save(record);

        // Save Refund
        Refund refund = modelMapper.map(refundDTO, Refund.class);
        refund.setRefundDate(LocalDateTime.now());
        refund.setTenantId(tenantId);
        // processedBy can be set from security context (e.g. current username)
        refund.setProcessedBy("ADMIN"); // Placeholder

        Refund saved = refundRepository.save(refund);
        return modelMapper.map(saved, RefundDTO.class);
    }

    @Override
    public List<TransactionDTO> getMyTransactions() {
        String email = SecurityUtils.getCurrentUserId(); // Gateway sends email
        String tenantId = SecurityUtils.getCurrentTenantId();

        try {
            StudentServiceClient.StudentResponse student = studentServiceClient.getStudentByEmail(email, tenantId)
                    .getApiData();
            if (student == null) {
                return Collections.emptyList();
            }
            return transactionRepository.findAllByStudentIdAndTenantId(student.getId(), tenantId).stream()
                    .map(t -> modelMapper.map(t, TransactionDTO.class))
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    @Override
    public Map<String, List<TransactionDTO>> getWardsTransactions() {
        String userId = SecurityUtils.getCurrentUserId();
        String tenantId = SecurityUtils.getCurrentTenantId();
        Map<String, List<TransactionDTO>> result = new HashMap<>();

        try {
            List<String> wardIds = studentServiceClient.getWardIdsByGuardianUserId(userId).getApiData();
            if (wardIds == null || wardIds.isEmpty()) {
                return result;
            }

            for (String wardId : wardIds) {
                List<TransactionDTO> transactions = transactionRepository
                        .findAllByStudentIdAndTenantId(wardId, tenantId).stream()
                        .map(t -> modelMapper.map(t, TransactionDTO.class))
                        .collect(Collectors.toList());
                result.put(wardId, transactions);
            }
        } catch (Exception e) {
            // Log error
        }
        return result;
    }
}
