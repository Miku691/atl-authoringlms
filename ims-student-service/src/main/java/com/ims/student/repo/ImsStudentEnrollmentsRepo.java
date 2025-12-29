package com.ims.student.repo;

import com.ims.student.entity.ImsStudentEnrollments;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsStudentEnrollmentsRepo extends JpaRepository<ImsStudentEnrollments, String> {
    List<ImsStudentEnrollments> findByStudentId(String studentId);
}
