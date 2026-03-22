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

/**
 * Implementation of FinanceService.
 */
@Service
public class FinanceServiceImpl implements FinanceService {

    private final StudentFeeRecordRepository studentFeeRecordRepository;
    private final TransactionRepository transactionRepository;
    private final RefundRepository refundRepository;
    private final DemandNoteRepository demandNoteRepository;
    private final com.ims.finance.repository.ExpenseRepository expenseRepository;
    private final FeeHeadRepository feeHeadRepository;
    private final ExpenseCategoryRepository expenseCategoryRepository;
    private final StudentServiceClient studentServiceClient;
    private final ModelMapper modelMapper;

    public FinanceServiceImpl(StudentFeeRecordRepository studentFeeRecordRepository,
            TransactionRepository transactionRepository,
            RefundRepository refundRepository,
            DemandNoteRepository demandNoteRepository,
            com.ims.finance.repository.ExpenseRepository expenseRepository,
            FeeHeadRepository feeHeadRepository,
            ExpenseCategoryRepository expenseCategoryRepository,
            StudentServiceClient studentServiceClient,
            ModelMapper modelMapper) {
        this.studentFeeRecordRepository = studentFeeRecordRepository;
        this.transactionRepository = transactionRepository;
        this.refundRepository = refundRepository;
        this.demandNoteRepository = demandNoteRepository;
        this.expenseRepository = expenseRepository;
        this.feeHeadRepository = feeHeadRepository;
        this.expenseCategoryRepository = expenseCategoryRepository;
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

        // 1. Pending Receivables
        BigDecimal pendingReceivables = studentFeeRecordRepository.sumTotalBalance(tenantId);
        if (pendingReceivables == null) pendingReceivables = BigDecimal.ZERO;

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
                if (((Number)row[0]).intValue() == yearVal && ((Number)row[1]).intValue() == monthVal) {
                    income = (BigDecimal) row[2];
                    break;
                }
            }
            
            BigDecimal expense = BigDecimal.ZERO;
            for (Object[] row : expenseTrend) {
                if (((Number)row[0]).intValue() == yearVal && ((Number)row[1]).intValue() == monthVal) {
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

        // Fetch offering names
        Map<String, String> offeringNames = new HashMap<>();
        // In a real scenario, we would call OfferingServiceClient here.
        // For now, we'll leave it as IDs or handle in UI if possible.

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

            if (Boolean.TRUE.equals(collectPaymentDTO.getWaiveLateFee())) {
                for (StudentFeeRecord record : recordsToPay) {
                    if (Boolean.TRUE.equals(record.getLateFeeApplied()) && record.getLateFeeAmount().compareTo(BigDecimal.ZERO) > 0) {
                        BigDecimal lateFee = record.getLateFeeAmount();
                        
                        // Deduct late fee from balance and amount due
                        record.setAmountDue(record.getAmountDue().subtract(lateFee));
                        record.setBalance(record.getBalance().subtract(lateFee));
                        record.setLateFeeAmount(BigDecimal.ZERO);
                        record.setLateFeeApplied(false);
                        
                        studentFeeRecordRepository.save(record);
                        
                        // Update the invoice if it's there
                        demandNoteRepository.findByStudentIdAndFeeHeadIdAndAcademicYearAndTenantId(
                            record.getStudentId(), record.getFeeHeadId(), record.getAcademicYear(), tenantId
                        ).ifPresent(demand -> {
                            demand.setBalance(demand.getBalance().subtract(lateFee));
                            if (demand.getBalance().compareTo(BigDecimal.ZERO) <= 0) {
                                demand.setStatus(DemandNote.DemandStatus.PAID);
                            }
                            demandNoteRepository.save(demand);
                        });
                    }
                }
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

    @Override
    public List<com.ims.finance.dto.DefaulterDTO> getDefaulters(String offeringId) {
        String tenantId = SecurityUtils.getCurrentTenantId();
        
        List<StudentFeeRecord.FeeStatus> unpaidStatuses = Arrays.asList(
                StudentFeeRecord.FeeStatus.UNPAID, 
                StudentFeeRecord.FeeStatus.PARTIAL
        );
        
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
                ApiResponse<StudentServiceClient.StudentResponse> response = 
                    studentServiceClient.getStudentById(studentId);
                if (response != null && response.getApiData() != null) {
                    studentName = response.getApiData().getFirstName() + " " + response.getApiData().getLastName();
                }
            } catch (Exception e) {
                // Ignore API error
            }

            // In a real app we might want to group by offering as well, but this is a simplified view
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

            BigDecimal totalAllocated = studentRecords.stream().map(StudentFeeRecord::getAmountDue).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalPaid = studentRecords.stream().map(StudentFeeRecord::getAmountPaid).reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal balance = studentRecords.stream().map(StudentFeeRecord::getBalance).reduce(BigDecimal.ZERO, BigDecimal::add);
            
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
                    studentName = res.getApiData().getFirstName() + " " + res.getApiData().getLastName();
                    enrollmentId = res.getApiData().getEnrollmentId();
                }
            } catch (Exception e) {}

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
        BigDecimal totalIncome = transactions.stream().map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        // Map income by category (Fee Head) - we fetch names from FeeHeadRepository
        List<com.ims.finance.entity.FeeHead> feeHeads = feeHeadRepository.findAllByTenantId(tenantId);
        Map<String, String> headNames = feeHeads.stream()
                .collect(Collectors.toMap(com.ims.finance.entity.FeeHead::getId, com.ims.finance.entity.FeeHead::getName, (a, b) -> a));

        List<StudentFeeRecord> feeRecords = studentFeeRecordRepository.findByTenantIdAndAcademicYear(tenantId, academicYear);
        Map<String, BigDecimal> incomeByCategory = feeRecords.stream()
                .collect(Collectors.groupingBy(
                        r -> headNames.getOrDefault(r.getFeeHeadId(), "Other"),
                        Collectors.reducing(BigDecimal.ZERO, StudentFeeRecord::getAmountPaid, BigDecimal::add)
                ));

        // 2. Calculate Expenses
        // Expenses don't have academicYear property yet. We filter by tenant for now.
        // TODO: Add academicYear to Expense entity if needed.
        List<com.ims.finance.entity.Expense> expenses = expenseRepository.findByTenantId(tenantId);
        BigDecimal totalExpense = expenses.stream().map(com.ims.finance.entity.Expense::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> expenseByCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory().getName(),
                        Collectors.reducing(BigDecimal.ZERO, com.ims.finance.entity.Expense::getAmount, BigDecimal::add)
                ));

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
            {"Tuition Fee", "Regular academic tuition charges"},
            {"Admission Fee", "One-time registration and admission charges"},
            {"Security Deposit", "Refundable caution money"},
            {"Lab Fee", "Laboratory and practical equipment usage"},
            {"Library Fee", "Access to library and digital resources"},
            {"Transportation Fee", "School bus or transit charges"}
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
            {"Salaries", "Payments to staff and faculty"},
            {"Rent", "Building or infrastructure lease payments"},
            {"Utilities", "Electricity, water, and digital subscriptions"},
            {"Maintenance", "Repair and upkeep of institutional assets"},
            {"Office Supplies", "Stationery and general administrative supplies"},
            {"Advertising", "Promotion and enrollment marketing costs"}
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
