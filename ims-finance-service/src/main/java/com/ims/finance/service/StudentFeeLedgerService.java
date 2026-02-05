package com.ims.finance.service;

import com.ims.finance.dto.FinanceSummaryDTO;
import com.ims.finance.dto.StudentFeeRecordDTO;
import java.util.List;
import java.util.Map;

public interface StudentFeeLedgerService {
    /**
     * Retrieves the financial ledger for a specific student.
     *
     * @param studentId student ID
     * @return list of fee records
     */
    List<StudentFeeRecordDTO> getStudentLedger(String studentId);

    /**
     * Retrieves all student fee records for the current tenant.
     *
     * @return list of all student fee records
     */
    List<StudentFeeRecordDTO> getAllLedgerRecords();

    /**
     * Retrieves own financial ledger for the logged-in student.
     */
    List<StudentFeeRecordDTO> getMyLedger();

    /**
     * Retrieves ledgers for all wards of the logged-in guardian.
     */
    Map<String, List<StudentFeeRecordDTO>> getWardsLedger();

    /**
     * Retrieves a summary for the student.
     */
    FinanceSummaryDTO getStudentSummary(String studentId);
}
