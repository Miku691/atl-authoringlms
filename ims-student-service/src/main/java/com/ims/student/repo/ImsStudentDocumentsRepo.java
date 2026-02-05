package com.ims.student.repo;

import com.ims.student.entity.ImsStudentDocuments;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImsStudentDocumentsRepo extends JpaRepository<ImsStudentDocuments, String> {
    List<ImsStudentDocuments> findByStudentId(String studentId);

    List<ImsStudentDocuments> findByTenantId(String tenantId);

    List<ImsStudentDocuments> findByStudentIdAndTenantId(String studentId, String tenantId);
}