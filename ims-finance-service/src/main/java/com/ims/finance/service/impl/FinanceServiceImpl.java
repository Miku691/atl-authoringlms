package com.ims.finance.service.impl;

import com.ims.finance.client.StudentServiceClient;
import com.ims.finance.dto.CollectPaymentDTO;
import com.ims.finance.dto.CollectionSummaryDTO;
import com.ims.finance.dto.FeePaymentDetailDTO;
import com.ims.finance.dto.RefundDTO;
import com.ims.finance.dto.TransactionDTO;
import com.ims.finance.entity.DemandNote;
import com.ims.finance.entity.Refund;
import com.ims.finance.entity.StudentFeeRecord;
import com.ims.finance.entity.Transaction;
import com.ims.finance.entity.FeeHead;
import com.ims.finance.entity.ExpenseCategory;
import com.ims.finance.exception.ResourceNotFoundException;
import com.ims.finance.repository.DemandNoteRepository;
import com.ims.finance.repository.RefundRepository;
import com.ims.finance.repository.StudentFeeRecordRepository;
import com.ims.finance.repository.TransactionRepository;
import com.ims.finance.repository.ExpenseCategoryRepository;
import com.ims.finance.repository.FeeHeadRepository;
import com.ims.finance.service.FinanceService;
import com.ims.finance.util.ApiResponse;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;

import lombok.extern.slf4j.Slf4j;

/**
 * Implementation of FinanceService.
 */
@Service
@Slf4j
public class FinanceServiceImpl implements FinanceService {

    private final StudentFeeRecordRepository studentFeeRecordRepository;
    private final TransactionRepository transactionRepository;
    private final RefundRepository refundRepository;
    private final DemandNoteRepository demandNoteRepository;
    private final com.ims.finance.repository.ExpenseRepository expenseRepository;
    private final FeeHeadRepository feeHeadRepository;
    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final StudentServiceClient studentServiceClient;
    private final com.ims.finance.client.OfferingServiceClient offeringServiceClient;
    private final InvoiceAsyncService invoiceAsyncService;
    private final ModelMapper modelMapper;

    public FinanceServiceImpl(StudentFeeRecordRepository studentFeeRecordRepository,
            TransactionRepository transactionRepository,
            RefundRepository refundRepository,
            DemandNoteRepository demandNoteRepository,
            com.ims.finance.repository.ExpenseRepository expenseRepository,
            FeeHeadRepository feeHeadRepository,
            ExpenseCategoryRepository expenseCategoryRepository,
            StudentServiceClient studentServiceClient,
            com.ims.finance.client.OfferingServiceClient offeringServiceClient,
            InvoiceAsyncService invoiceAsyncService,
            ModelMapper modelMapper) {
        this.studentFeeRecordRepository = studentFeeRecordRepository;
        this.transactionRepository = transactionRepository;
        this.refundRepository = refundRepository;
        this.demandNoteRepository = demandNoteRepository;
        this.expenseRepository = expenseRepository;
        this.feeHeadRepository = feeHeadRepository;
        this.expenseCategoryRepository = expenseCategoryRepository;
        this.studentServiceClient = studentServiceClient;
        this.offeringServiceClient = offeringServiceClient;
        this.invoiceAsyncService = invoiceAsyncService;
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

        // Fetch offering names for the entire summary (including charts and recent tx)
        Map<String, String> offeringNames = new HashMap<>();
        try {
            ApiResponse<List<com.ims.finance.client.OfferingServiceClient.OfferingResponse>> offeringRes = offeringServiceClient
                    .getOfferingsByTenant(tenantId);
            if (offeringRes != null && offeringRes.getApiData() != null) {
                offeringRes.getApiData().forEach(o -> offeringNames.put(o.getId(), o.getName()));
            }
        } catch (Exception e) {
            // Ignore API error for dashboard
        }

        List<Object[]> offeringStats = transactionRepository.sumAmountByOffering(tenantId);
        Map<String, BigDecimal> collectionByOffering = new HashMap<>();
        for (Object[] row : offeringStats) {
            collectionByOffering.put((String) row[0], (BigDecimal) row[1]);
        }

        // 1. Fetch recent transactions (fetch more to allow grouping)
        List<Transaction> recentRaw = transactionRepository.findAllByTenantIdOrderByTransactionDateDesc(tenantId)
                .stream()
                .limit(50) 
                .collect(Collectors.toList());

        // 2. Group by ReceiptNo 
        Map<String, TransactionDTO> groupedRecent = new LinkedHashMap<>(); // Use LinkedHashMap to maintain time order

        for (Transaction t : recentRaw) {
            String groupKey = (t.getReceiptNo() != null && !t.getReceiptNo().isEmpty()) ? t.getReceiptNo() : t.getId();
            
            if (groupedRecent.containsKey(groupKey)) {
                TransactionDTO existing = groupedRecent.get(groupKey);
                existing.setAmount(existing.getAmount().add(t.getAmount()));
                if (t.getFeeHeadName() != null && !t.getFeeHeadName().isEmpty()) {
                    existing.setFeeHeadName(existing.getFeeHeadName() + ", " + t.getFeeHeadName());
                }
            } else {
                TransactionDTO dto = modelMapper.map(t, TransactionDTO.class);
                // Fetch Student Name (Small batch, 10 items max)
                try {
                    ApiResponse<StudentServiceClient.StudentResponse> studentRes = studentServiceClient
                            .getStudentById(t.getStudentId());
                    if (studentRes != null && studentRes.getApiData() != null) {
                        dto.setStudentName(studentRes.getApiData().getFirstName() + " "
                                + studentRes.getApiData().getLastName());
                    } else {
                        dto.setStudentName("Student: " + t.getStudentId().substring(0, 8));
                    }
                } catch (Exception e) {
                    dto.setStudentName("Student: " + t.getStudentId().substring(0, 8));
                }

                if (t.getOfferingId() != null) {
                    dto.setOfferingName(resolveOfferingName(t.getOfferingId(), offeringNames));
                }
                groupedRecent.put(groupKey, dto);
            }
            
            if (groupedRecent.size() >= 10) break; // We only need top 10 grouped items
        }

        List<TransactionDTO> recent = new ArrayList<>(groupedRecent.values());

        // Ensure all offering IDs in the chart have names in the map
        for (String id : collectionByOffering.keySet()) {
            if (!offeringNames.containsKey(id)) {
                offeringNames.put(id, resolveOfferingName(id, offeringNames));
            }
        }

        // 1. Pending Receivables
        BigDecimal pendingReceivables = studentFeeRecordRepository.sumTotalBalance(tenantId);
        if (pendingReceivables == null)
            pendingReceivables = BigDecimal.ZERO;

        // 2. Monthly Trend (Last 6 Months)
        LocalDate trendStart = LocalDate.now().minusMonths(5).withDayOfMonth(1);
        LocalDateTime trendStartDateTime = trendStart.atStartOfDay();

        List<Object[]> incomeTrend = transactionRepository.sumAmountByMonth(tenantId, trendStartDateTime);
        List<Object[]> expenseTrend = expenseRepository.sumAmountByMonth(tenantId, trendStart);

        List<Map<String, Object>> monthlyTrend = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            LocalDate monthDate = trendStart.plusMonths(i);
            int yearVal = monthDate.getYear();
            int monthVal = monthDate.getMonthValue();
            String monthName = monthDate.getMonth().getDisplayName(java.time.format.TextStyle.SHORT, Locale.ENGLISH);

            BigDecimal income = BigDecimal.ZERO;
            for (Object[] row : incomeTrend) {
                if (((Number) row[0]).intValue() == yearVal && ((Number) row[1]).intValue() == monthVal) {
                    income = (BigDecimal) row[2];
                    break;
                }
            }

            BigDecimal expense = BigDecimal.ZERO;
            for (Object[] row : expenseTrend) {
                if (((Number) row[0]).intValue() == yearVal && ((Number) row[1]).intValue() == monthVal) {
                    expense = (BigDecimal) row[2];
                    break;
                }
            }

            Map<String, Object> data = new HashMap<>();
            data.put("month", monthName);
            data.put("income", income);
            data.put("expense", expense);
            monthlyTrend.add(data);
        }

        // 3. Fee Distribution (Collection by Fee Head)
        List<Object[]> distributionData = studentFeeRecordRepository.sumPaidByFeeHead(tenantId);
        List<Map<String, Object>> feeDistribution = new ArrayList<>();
        List<FeeHead> allFeeHeads = feeHeadRepository.findAllByTenantId(tenantId);
        Map<String, String> headNames = allFeeHeads.stream()
                .collect(Collectors.toMap(FeeHead::getId, FeeHead::getName, (a, b) -> a));

        for (Object[] row : distributionData) {
            Map<String, Object> item = new HashMap<>();
            item.put("name", headNames.getOrDefault((String) row[0], "Other"));
            item.put("value", (BigDecimal) row[1]);
            feeDistribution.add(item);
        }

        // offeringNames already populated above

        return CollectionSummaryDTO.builder()
                .todayCollection(today != null ? today : BigDecimal.ZERO)
                .monthCollection(month != null ? month : BigDecimal.ZERO)
                .yearCollection(year != null ? year : BigDecimal.ZERO)
                .collectionByOffering(collectionByOffering)
                .offeringNames(offeringNames)
                .recentTransactions(recent)
                .pendingReceivables(pendingReceivables)
                .monthlyTrend(monthlyTrend)
                .feeDistribution(feeDistribution)
                .build();
    }

    @Override
    @Transactional
    public TransactionDTO collectPayment(CollectPaymentDTO collectPaymentDTO) {
        String tenantId = SecurityUtils.getCurrentTenantId();
        String collectedBy = SecurityUtils.getCurrentUserId();
        String roles = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.joining(","));
        String receiptNo = "RCPT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        BigDecimal remainingAmount = collectPaymentDTO.getAmount();
        List<Transaction> savedTransactions = new ArrayList<>();

        // 1. Handle Explicit Split Breakdown (New Feature)
        if (collectPaymentDTO.getSplitBreakdown() != null && !collectPaymentDTO.getSplitBreakdown().isEmpty()) {
            for (FeePaymentDetailDTO detail : collectPaymentDTO.getSplitBreakdown()) {
                studentFeeRecordRepository.findById(detail.getFeeRecordId()).ifPresent(record -> {
                    BigDecimal amountToPay = detail.getAmount();
                    applyPaymentToRecord(record, amountToPay, receiptNo, collectPaymentDTO.getPaymentMode(),
                            collectPaymentDTO.getReferenceNumber(), collectedBy, tenantId, savedTransactions);
                });
            }
        }
        // 2. Handle Specific Fee Record IDs (Current logic - Auto-allocation)
        else if (collectPaymentDTO.getFeeRecordIds() != null && !collectPaymentDTO.getFeeRecordIds().isEmpty()) {
            List<StudentFeeRecord> recordsToPay = studentFeeRecordRepository
                    .findAllById(collectPaymentDTO.getFeeRecordIds());
            for (StudentFeeRecord record : recordsToPay) {
                if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0)
                    break;
                BigDecimal amountToPay = remainingAmount.min(record.getBalance());
                applyPaymentToRecord(record, amountToPay, receiptNo, collectPaymentDTO.getPaymentMode(),
                        collectPaymentDTO.getReferenceNumber(), collectedBy, tenantId, savedTransactions);
                remainingAmount = remainingAmount.subtract(amountToPay);
            }
        }
        // 3. Handle FIFO (Oldest first)
        else {
            List<StudentFeeRecord> recordsToPay = studentFeeRecordRepository
                    .findAllByStudentIdAndTenantId(collectPaymentDTO.getStudentId(), tenantId)
                    .stream()
                    .filter(r -> r.getStatus() != StudentFeeRecord.FeeStatus.PAID)
                    .sorted(Comparator.comparing(StudentFeeRecord::getDueDate))
                    .collect(Collectors.toList());

            for (StudentFeeRecord record : recordsToPay) {
                if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0)
                    break;
                BigDecimal amountToPay = remainingAmount.min(record.getBalance());
                applyPaymentToRecord(record, amountToPay, receiptNo, collectPaymentDTO.getPaymentMode(),
                        collectPaymentDTO.getReferenceNumber(), collectedBy, tenantId, savedTransactions);
                remainingAmount = remainingAmount.subtract(amountToPay);
            }
        }

        // Trigger Async Invoice Generation (Passing Identity to fix 403)
        invoiceAsyncService.generateAndSendInvoice(receiptNo, collectPaymentDTO.getStudentId(), tenantId, collectedBy, roles);

        if (savedTransactions.isEmpty()) {
            throw new RuntimeException("No payments were applied. Possible zero balance or invalid fee heads.");
        }

        // Return a representative DTO (using the last saved transaction or a summary)
        TransactionDTO response = modelMapper.map(savedTransactions.get(0), TransactionDTO.class);
        response.setAmount(collectPaymentDTO.getAmount()); // Show total amount in response
        response.setReceiptNo(receiptNo);
        return response;
    }

    private void applyPaymentToRecord(StudentFeeRecord record, BigDecimal amount, String receiptNo,
            Transaction.PaymentMode mode, String refNo,
            String collectedBy, String tenantId, List<Transaction> savedList) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0)
            return;

        // Update Record
        record.setAmountPaid(record.getAmountPaid().add(amount));
        record.setBalance(record.getBalance().subtract(amount));
        if (record.getBalance().compareTo(BigDecimal.ZERO) <= 0) {
            record.setStatus(StudentFeeRecord.FeeStatus.PAID);
        } else {
            record.setStatus(StudentFeeRecord.FeeStatus.PARTIAL);
        }
        studentFeeRecordRepository.save(record);

        // Record Detailed Transaction
        Transaction tx = new Transaction();
        tx.setStudentId(record.getStudentId());
        tx.setAmount(amount);
        tx.setPaymentMode(mode);
        tx.setReferenceNumber(refNo);
        tx.setTransactionDate(LocalDateTime.now());
        tx.setTenantId(tenantId);
        tx.setCollectedBy(collectedBy);
        tx.setReceiptNo(receiptNo);
        tx.setFeeHeadId(record.getFeeHeadId());
        tx.setAcademicYear(record.getAcademicYear());
        tx.setOfferingId(record.getOfferingId());

        // Fetch Fee Head Name for convenience in reporting
        feeHeadRepository.findById(record.getFeeHeadId()).ifPresent(fh -> tx.setFeeHeadName(fh.getName()));

        transactionRepository.save(tx);
        savedList.add(tx);

        // Update associated Demand Note if exists
        demandNoteRepository.findByStudentIdAndFeeHeadIdAndAcademicYearAndTenantId(
                record.getStudentId(), record.getFeeHeadId(), record.getAcademicYear(), tenantId).ifPresent(demand -> {
                    demand.setAmountPaid(demand.getAmountPaid().add(amount));
                    demand.setBalance(demand.getBalance().subtract(amount));
                    if (demand.getBalance().compareTo(BigDecimal.ZERO) <= 0) {
                        demand.setStatus(DemandNote.DemandStatus.PAID);
                    } else {
                        demand.setStatus(DemandNote.DemandStatus.PARTIAL);
                    }
                    demandNoteRepository.save(demand);
                });
    }

    @Override
    public List<TransactionDTO> getStudentTransactions(String studentId) {
        String tenantId = SecurityUtils.getCurrentTenantId();

        // Fetch student name once
        String studentName = "Student: " + studentId.substring(0, 8);
        try {
            ApiResponse<StudentServiceClient.StudentResponse> studentRes = studentServiceClient
                    .getStudentById(studentId);
            if (studentRes != null && studentRes.getApiData() != null) {
                studentName = studentRes.getApiData().getFirstName() + " " + studentRes.getApiData().getLastName();
            }
        } catch (Exception e) {
        }

        final String finalStudentName = studentName;

        // Fetch offering names for the tenant (caching would be better, but this is
        // simple)
        Map<String, String> offeringNames = new HashMap<>();
        try {
            ApiResponse<List<com.ims.finance.client.OfferingServiceClient.OfferingResponse>> offeringRes = offeringServiceClient
                    .getOfferingsByTenant(tenantId);
            if (offeringRes != null && offeringRes.getApiData() != null) {
                offeringRes.getApiData().forEach(o -> offeringNames.put(o.getId(), o.getName()));
            }
        } catch (Exception e) {
        }

        return transactionRepository.findAllByStudentIdAndTenantId(studentId, tenantId).stream()
                .map(t -> {
                    TransactionDTO dto = modelMapper.map(t, TransactionDTO.class);
                    dto.setStudentName(finalStudentName);
                    if (t.getOfferingId() != null) {
                        dto.setOfferingName(resolveOfferingName(t.getOfferingId(), offeringNames));
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    private String resolveOfferingName(String offeringId, Map<String, String> cache) {
        if (offeringId == null)
            return null;
        if (cache.containsKey(offeringId)) {
            return cache.get(offeringId);
        }

        // Try specific fetch from academic service if missing in tenant map
        try {
            ApiResponse<com.ims.finance.client.OfferingServiceClient.OfferingResponse> res = offeringServiceClient
                    .getOfferingById(offeringId);
            if (res != null && res.getApiData() != null) {
                String name = res.getApiData().getName();
                log.info("Resolved offering name for ID {}: {}", offeringId, name);
                cache.put(offeringId, name);
                return name;
            } else {
                log.warn("Failed to resolve offering name for ID {}: API response empty", offeringId);
            }
        } catch (Exception e) {
            log.error("Error connecting to academic service to resolve offering ID {}: {}", offeringId, e.getMessage());
        }

        return "Class " + offeringId.substring(0, 8);
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

    @Override
    public List<TransactionDTO> getTransactionsByReceipt(String receiptNo, String tenantId) {
        return transactionRepository.findByReceiptNoAndTenantId(receiptNo, tenantId).stream()
                .map(t -> {
                    TransactionDTO dto = modelMapper.map(t, TransactionDTO.class);
                    // Student name is likely needed for the invoice
                    try {
                        ApiResponse<StudentServiceClient.StudentResponse> studentRes = studentServiceClient
                                .getStudentById(t.getStudentId());
                        if (studentRes != null && studentRes.getApiData() != null) {
                            dto.setStudentName(studentRes.getApiData().getFirstName() + " "
                                    + studentRes.getApiData().getLastName());
                        }
                    } catch (Exception e) {
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<com.ims.finance.dto.DefaulterDTO> getDefaulters(String offeringId) {
        String tenantId = SecurityUtils.getCurrentTenantId();

        List<StudentFeeRecord.FeeStatus> unpaidStatuses = Arrays.asList(
                StudentFeeRecord.FeeStatus.UNPAID,
                StudentFeeRecord.FeeStatus.PARTIAL);

        List<StudentFeeRecord> overdueRecords;

        if (offeringId != null && !offeringId.isEmpty()) {
            overdueRecords = studentFeeRecordRepository.findByTenantIdAndOfferingIdAndStatusInAndDueDateBefore(
                    tenantId, offeringId, unpaidStatuses, LocalDate.now());
        } else {
            overdueRecords = studentFeeRecordRepository.findByTenantIdAndStatusInAndDueDateBefore(
                    tenantId, unpaidStatuses, LocalDate.now());
        }

        // Group by Student
        Map<String, List<StudentFeeRecord>> recordsByStudent = overdueRecords.stream()
                .collect(Collectors.groupingBy(StudentFeeRecord::getStudentId));

        List<com.ims.finance.dto.DefaulterDTO> defaulters = new ArrayList<>();

        for (Map.Entry<String, List<StudentFeeRecord>> entry : recordsByStudent.entrySet()) {
            String studentId = entry.getKey();
            List<StudentFeeRecord> studentRecords = entry.getValue();

            BigDecimal totalOverdue = studentRecords.stream()
                    .map(StudentFeeRecord::getBalance)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalLateFee = studentRecords.stream()
                    .map(r -> r.getLateFeeApplied() ? r.getLateFeeAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            LocalDate earliestDueDate = studentRecords.stream()
                    .map(StudentFeeRecord::getDueDate)
                    .min(LocalDate::compareTo)
                    .orElse(null);

            // Fetch Student Name
            String studentName = "Unknown";
            try {
                ApiResponse<StudentServiceClient.StudentResponse> response = studentServiceClient
                        .getStudentById(studentId);
                if (response != null && response.getApiData() != null) {
                    StudentServiceClient.StudentResponse s = response.getApiData();
                    studentName = (s.getFirstName() != null ? s.getFirstName() : "") + " " +
                            (s.getLastName() != null ? s.getLastName() : "");
                    if (studentName.trim().isEmpty())
                        studentName = "Unknown (" + studentId.substring(0, 8) + ")";
                }
            } catch (Exception e) {
                // Ignore API error, keep Unknown
            }

            // In a real app we might want to group by offering as well, but this is a
            // simplified view
            String recordOfferingId = studentRecords.get(0).getOfferingId();

            com.ims.finance.dto.DefaulterDTO dto = com.ims.finance.dto.DefaulterDTO.builder()
                    .studentId(studentId)
                    .studentName(studentName)
                    .offeringId(recordOfferingId)
                    .totalOverdue(totalOverdue)
                    .totalLateFee(totalLateFee)
                    .overdueInstallmentsCount(studentRecords.size())
                    .earliestDueDate(earliestDueDate)
                    .build();

            defaulters.add(dto);
        }

        return defaulters.stream()
                .sorted(Comparator.comparing(com.ims.finance.dto.DefaulterDTO::getTotalOverdue).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public List<TransactionDTO> getDayBook(LocalDate date) {
        String tenantId = SecurityUtils.getCurrentTenantId();
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        return transactionRepository.findAllByTenantIdAndTransactionDateBetween(tenantId, startOfDay, endOfDay)
                .stream()
                .map(t -> modelMapper.map(t, TransactionDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<com.ims.finance.dto.OutstandingFeeDTO> getOutstandingFees() {
        String tenantId = SecurityUtils.getCurrentTenantId();

        // Find all records with balance > 0
        List<StudentFeeRecord> outstandingRecords = studentFeeRecordRepository.findByTenantIdAndBalanceGreaterThan(
                tenantId, BigDecimal.ZERO);

        // Group by Student
        Map<String, List<StudentFeeRecord>> grouped = outstandingRecords.stream()
                .collect(Collectors.groupingBy(StudentFeeRecord::getStudentId));

        List<com.ims.finance.dto.OutstandingFeeDTO> report = new ArrayList<>();

        for (Map.Entry<String, List<StudentFeeRecord>> entry : grouped.entrySet()) {
            String studentId = entry.getKey();
            List<StudentFeeRecord> studentRecords = entry.getValue();

            BigDecimal totalAllocated = studentRecords.stream().map(StudentFeeRecord::getAmountDue)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalPaid = studentRecords.stream().map(StudentFeeRecord::getAmountPaid).reduce(BigDecimal.ZERO,
                    BigDecimal::add);
            BigDecimal balance = studentRecords.stream().map(StudentFeeRecord::getBalance).reduce(BigDecimal.ZERO,
                    BigDecimal::add);

            BigDecimal overdue = studentRecords.stream()
                    .filter(r -> r.getDueDate().isBefore(LocalDate.now()))
                    .map(StudentFeeRecord::getBalance)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Fetch Student Details
            String studentName = "Unknown";
            String enrollmentId = "";
            String offeringName = "";
            try {
                ApiResponse<StudentServiceClient.StudentResponse> res = studentServiceClient.getStudentById(studentId);
                if (res != null && res.getApiData() != null) {
                    StudentServiceClient.StudentResponse s = res.getApiData();
                    studentName = (s.getFirstName() != null ? s.getFirstName() : "") + " " +
                            (s.getLastName() != null ? s.getLastName() : "");
                    if (studentName.trim().isEmpty())
                        studentName = "Unknown (" + studentId.substring(0, 8) + ")";
                    enrollmentId = s.getEnrollmentId();
                }
            } catch (Exception e) {
                // Ignore API error
            }

            // Also try to get offering name for report
            try {
                ApiResponse<com.ims.finance.client.OfferingServiceClient.OfferingResponse> offRes = offeringServiceClient
                        .getOfferingById(studentRecords.get(0).getOfferingId());
                if (offRes != null && offRes.getApiData() != null) {
                    offeringName = offRes.getApiData().getName();
                }
            } catch (Exception e) {
            }

            report.add(com.ims.finance.dto.OutstandingFeeDTO.builder()
                    .studentId(studentId)
                    .studentName(studentName)
                    .enrollmentId(enrollmentId)
                    .offeringId(studentRecords.get(0).getOfferingId())
                    .offeringName(offeringName)
                    .totalAllocated(totalAllocated)
                    .totalPaid(totalPaid)
                    .totalOverdue(overdue)
                    .balance(balance)
                    .build());
        }

        return report.stream()
                .sorted(Comparator.comparing(com.ims.finance.dto.OutstandingFeeDTO::getBalance).reversed())
                .collect(Collectors.toList());
    }

    @Override
    public com.ims.finance.dto.IncomeExpenseReportDTO getIncomeExpenseReport(String academicYear) {
        String tenantId = SecurityUtils.getCurrentTenantId();

        // 1. Calculate Income (Collected Fees)
        List<Transaction> transactions = transactionRepository.findByTenantIdAndAcademicYear(tenantId, academicYear);
        BigDecimal totalIncome = transactions.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO,
                BigDecimal::add);

        // Map income by category (Fee Head) - we fetch names from FeeHeadRepository
        List<com.ims.finance.entity.FeeHead> feeHeads = feeHeadRepository.findAllByTenantId(tenantId);
        Map<String, String> headNames = feeHeads.stream()
                .collect(Collectors.toMap(com.ims.finance.entity.FeeHead::getId,
                        com.ims.finance.entity.FeeHead::getName, (a, b) -> a));

        List<StudentFeeRecord> feeRecords = studentFeeRecordRepository.findByTenantIdAndAcademicYear(tenantId,
                academicYear);
        Map<String, BigDecimal> incomeByCategory = feeRecords.stream()
                .collect(Collectors.groupingBy(
                        r -> headNames.getOrDefault(r.getFeeHeadId(), "Other"),
                        Collectors.reducing(BigDecimal.ZERO, StudentFeeRecord::getAmountPaid, BigDecimal::add)));

        // 2. Calculate Expenses
        // Expenses don't have academicYear property yet. We filter by tenant for now.
        // TODO: Add academicYear to Expense entity if needed.
        List<com.ims.finance.entity.Expense> expenses = expenseRepository.findByTenantId(tenantId);
        BigDecimal totalExpense = expenses.stream().map(com.ims.finance.entity.Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> expenseByCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory().getName(),
                        Collectors.reducing(BigDecimal.ZERO, com.ims.finance.entity.Expense::getAmount,
                                BigDecimal::add)));

        return com.ims.finance.dto.IncomeExpenseReportDTO.builder()
                .academicYear(academicYear)
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netProfit(totalIncome.subtract(totalExpense))
                .incomeByCategory(incomeByCategory)
                .expenseByCategory(expenseByCategory)
                .build();
    }

    @Override
    @Transactional
    public void bootstrapFeeHeads() {
        String tenantId = SecurityUtils.getCurrentTenantId();
        String[][] standardHeads = {
                { "Tuition Fee", "Regular academic tuition charges" },
                { "Admission Fee", "One-time registration and admission charges" },
                { "Security Deposit", "Refundable caution money" },
                { "Lab Fee", "Laboratory and practical equipment usage" },
                { "Library Fee", "Access to library and digital resources" },
                { "Transportation Fee", "School bus or transit charges" }
        };

        for (String[] head : standardHeads) {
            if (!feeHeadRepository.existsByTenantIdAndName(tenantId, head[0])) {
                FeeHead fh = new FeeHead();
                fh.setName(head[0]);
                fh.setDescription(head[1]);
                fh.setTenantId(tenantId);
                feeHeadRepository.save(fh);
            }
        }
    }

    @Override
    @Transactional
    public void bootstrapExpenseCategories() {
        String tenantId = SecurityUtils.getCurrentTenantId();
        String[][] standardCategories = {
                { "Salaries", "Payments to staff and faculty" },
                { "Rent", "Building or infrastructure lease payments" },
                { "Utilities", "Electricity, water, and digital subscriptions" },
                { "Maintenance", "Repair and upkeep of institutional assets" },
                { "Office Supplies", "Stationery and general administrative supplies" },
                { "Advertising", "Promotion and enrollment marketing costs" }
        };

        for (String[] cat : standardCategories) {
            if (!expenseCategoryRepository.existsByTenantIdAndName(tenantId, cat[0])) {
                ExpenseCategory ec = new ExpenseCategory();
                ec.setName(cat[0]);
                ec.setDescription(cat[1]);
                ec.setTenantId(tenantId);
                expenseCategoryRepository.save(ec);
            }
        }
    }

    @Override
    public Map<String, Boolean> getBulkSetupStatus() {
        String tenantId = SecurityUtils.getCurrentTenantId();
        Map<String, Boolean> status = new HashMap<>();
        status.put("feeHeads", !feeHeadRepository.findAllByTenantId(tenantId).isEmpty());
        status.put("expenseCategories", !expenseCategoryRepository.findByTenantId(tenantId).isEmpty());
        return status;
    }
}
