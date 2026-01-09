package com.ims.student.repo;

import com.ims.student.entity.ImsStudentEnrollments;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsStudentEnrollmentsRepo extends JpaRepository<ImsStudentEnrollments, String> {
    List<ImsStudentEnrollments> findByStudentId(String studentId);

    boolean existsByStudentIdAndOfferingIdAndStatus(String studentId, String offeringId, String status);

    List<ImsStudentEnrollments> findByStudentIdAndStatus(String studentId, String status);

    Page<ImsStudentEnrollments> findByOfferingIdAndStatus(String offeringId, String status, Pageable pageable);
}
