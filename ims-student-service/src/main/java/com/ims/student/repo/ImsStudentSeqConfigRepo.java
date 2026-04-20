package com.ims.student.repo;

import com.ims.student.entity.ImsStudentSeqConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ImsStudentSeqConfigRepo extends JpaRepository<ImsStudentSeqConfig, String> {
    Optional<ImsStudentSeqConfig> findByTenantId(String tenantId);
}
