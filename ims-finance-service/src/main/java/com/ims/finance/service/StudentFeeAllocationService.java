package com.ims.finance.service;

import com.ims.finance.dto.StudentFeeRecordDTO;
import java.util.List;

public interface StudentFeeAllocationService {
    /**
     * Allocates fees to a student based on their offering.
     *
     * @param studentId    student ID
     * @param offeringId   offering ID
     * @param academicYear academic year
     */
    void allocateFeesToStudent(String studentId, String offeringId, String academicYear);
}
