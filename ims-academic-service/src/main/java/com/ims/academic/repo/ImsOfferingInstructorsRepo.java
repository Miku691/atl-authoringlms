package com.ims.academic.repo;

import com.ims.academic.entity.ImsOfferingInstructors;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsOfferingInstructorsRepo extends JpaRepository<ImsOfferingInstructors, String> {

    List<ImsOfferingInstructors> findByOfferingId(String offeringId);

    List<ImsOfferingInstructors> findByInstructorId(String instructorId);

    boolean existsByOfferingIdAndInstructorIdAndSubjectId(String offeringId, String instructorId, String subjectId);
}
