package com.ims.instructor.repo;

import com.ims.instructor.entity.ImsInstructorDocuments;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsInstructorDocumentsRepo extends JpaRepository<ImsInstructorDocuments, String> {
    List<ImsInstructorDocuments> findByInstructorId(String instructorId);
}
