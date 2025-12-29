package com.ims.student.repo;

import com.ims.student.entity.ImsStudentDocuments;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsStudentDocumentsRepo extends JpaRepository<ImsStudentDocuments, String> {
    List<ImsStudentDocuments> findByStudentId(String studentId);
}