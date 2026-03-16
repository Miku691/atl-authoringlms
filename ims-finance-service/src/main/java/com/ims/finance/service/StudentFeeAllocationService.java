package com.ims.finance.service;

public interface StudentFeeAllocationService {
    /**
     * Allocates fees to a student based on their offering.
     *
     * @param studentId    student ID
     * @param offeringId   offering ID
     * @param academicYear academic year
     */
    void allocateFeesToStudent(String studentId, String offeringId, String academicYear);

    /**
     * Bulk allocates fees to all students in an offering.
     *
     * @param offeringId   offering ID
     * @param academicYear academic year
     */
    void bulkAllocateFees(String offeringId, String academicYear);
}
