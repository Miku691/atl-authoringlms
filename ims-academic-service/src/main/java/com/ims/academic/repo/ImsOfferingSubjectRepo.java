package com.ims.academic.repo;

import com.ims.academic.entity.ImsOfferingSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImsOfferingSubjectRepo extends JpaRepository<ImsOfferingSubject, String> {
    List<ImsOfferingSubject> findByOfferingId(String offeringId);

    boolean existsByOfferingIdAndSubjectId(String offeringId, String subjectId);
}
