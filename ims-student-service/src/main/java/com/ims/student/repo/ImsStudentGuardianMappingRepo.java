package com.ims.student.repo;

import com.ims.student.entity.ImsStudentGuardianMapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImsStudentGuardianMappingRepo extends JpaRepository<ImsStudentGuardianMapping, String> {
    List<ImsStudentGuardianMapping> findByStudentId(String studentId);

    List<ImsStudentGuardianMapping> findByGuardianId(String guardianId);
}
