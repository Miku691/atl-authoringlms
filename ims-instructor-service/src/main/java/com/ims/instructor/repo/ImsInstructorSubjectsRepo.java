package com.ims.instructor.repo;

import com.ims.instructor.entity.ImsInstructorSubjects;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImsInstructorSubjectsRepo extends JpaRepository<ImsInstructorSubjects, String> {
    List<ImsInstructorSubjects> findByInstructorId(String instructorId);

    List<ImsInstructorSubjects> findBySubjectId(String subjectId);

    Optional<ImsInstructorSubjects> findByInstructorIdAndSubjectId(String instructorId, String subjectId);
}
