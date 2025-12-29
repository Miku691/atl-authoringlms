package com.ims.student.repo;

import com.ims.student.entity.ImsStudentGuardians;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsStudentGuardiansRepo extends JpaRepository<ImsStudentGuardians, String> {
    List<ImsStudentGuardians> findByStudentId(String studentId);
}
