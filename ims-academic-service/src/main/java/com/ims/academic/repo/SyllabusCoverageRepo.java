package com.ims.academic.repo;

import com.ims.academic.entity.SyllabusCoverage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SyllabusCoverageRepo extends JpaRepository<SyllabusCoverage, String> {
    List<SyllabusCoverage> findByOfferingSubjectId(String offeringSubjectId);

    Optional<SyllabusCoverage> findByOfferingSubjectIdAndTopicId(String offeringSubjectId, String topicId);
}
