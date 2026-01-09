package com.ims.academic.repo;

import com.ims.academic.entity.ImsOfferingSubjects;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsOfferingSubjectsRepo extends JpaRepository<ImsOfferingSubjects, String> {

    boolean existsByOfferingIdAndSubjectId(String offeringId, String subjectId);

    List<ImsOfferingSubjects> findByOfferingId(String offeringId);
}
