package com.ims.finance.repository;

import com.ims.finance.entity.StudentFeeConcession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentFeeConcessionRepository extends JpaRepository<StudentFeeConcession, String> {
    List<StudentFeeConcession> findByTenantId(String tenantId);
    List<StudentFeeConcession> findByStudentIdAndTenantId(String studentId, String tenantId);
    List<StudentFeeConcession> findByStudentIdAndAcademicYearAndTenantId(String studentId, String academicYear, String tenantId);
}
