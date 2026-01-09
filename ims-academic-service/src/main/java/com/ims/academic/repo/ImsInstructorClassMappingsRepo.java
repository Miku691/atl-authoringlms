package com.ims.academic.repo;

import com.ims.academic.entity.ImsInstructorClassMappings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsInstructorClassMappingsRepo extends JpaRepository<ImsInstructorClassMappings, String> {
    List<ImsInstructorClassMappings> findByInstructorId(String instructorId);

    List<ImsInstructorClassMappings> findByClassId(String classId);
}
