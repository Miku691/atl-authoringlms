package com.ims.academic.repo;

import com.ims.academic.entity.ImsAssignmentSubmissions;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsAssignmentSubmissionsRepo extends JpaRepository<ImsAssignmentSubmissions, String> {
    List<ImsAssignmentSubmissions> findByAssignmentId(String assignmentId);

    List<ImsAssignmentSubmissions> findByStudentId(String studentId);
}
