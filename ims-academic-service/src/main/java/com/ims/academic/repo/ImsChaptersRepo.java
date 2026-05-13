package com.ims.academic.repo;

import com.ims.academic.entity.ImsChapters;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImsChaptersRepo extends JpaRepository<ImsChapters, String> {
    List<ImsChapters> findByOfferingSubjectIdOrderByOrderIndexAsc(String offeringSubjectId);
    List<ImsChapters> findByLevelIdAndSubjectIdOrderByOrderIndexAsc(String levelId, String subjectId);
}
