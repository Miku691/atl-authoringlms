package com.ims.student.repo;

import com.ims.student.entity.ImsStudentLeaves;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImsStudentLeavesRepo extends JpaRepository<ImsStudentLeaves, String> {
    List<ImsStudentLeaves> findByStudentId(String studentId);
    List<ImsStudentLeaves> findByTenantId(String tenantId);
    List<ImsStudentLeaves> findByStatusAndTenantId(String status, String tenantId);
}
