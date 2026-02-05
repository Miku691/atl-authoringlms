package com.ims.academic.repo;

import com.ims.academic.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DepartmentRepo extends JpaRepository<Department, String> {
    List<Department> findByTenantId(String tenantId);
}
