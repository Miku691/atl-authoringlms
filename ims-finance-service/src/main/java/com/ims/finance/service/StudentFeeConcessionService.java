package com.ims.finance.service;

import com.ims.finance.dto.StudentFeeConcessionDTO;
import java.util.List;

public interface StudentFeeConcessionService {
    StudentFeeConcessionDTO grantConcession(StudentFeeConcessionDTO request);
    List<StudentFeeConcessionDTO> getConcessionsByStudent(String studentId);
    List<StudentFeeConcessionDTO> getActiveConcessionsByStudentAndYear(String studentId, String academicYear);
    StudentFeeConcessionDTO updateConcessionStatus(String id, String status);
    void revokeConcession(String id);
}
