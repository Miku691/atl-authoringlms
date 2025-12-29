package com.ims.instructor.repo;

import com.ims.instructor.entity.ImsInstructorSubjects;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsInstructorSubjectsRepo extends JpaRepository<ImsInstructorSubjects, String> {

    List<ImsInstructorSubjects> findByInstructorId(String instructorId);

    boolean existsByInstructorIdAndSubjectId(String instructorId, String subjectId);
}
