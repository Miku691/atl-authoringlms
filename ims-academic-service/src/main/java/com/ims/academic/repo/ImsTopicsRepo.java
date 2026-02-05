package com.ims.academic.repo;

import com.ims.academic.entity.ImsTopics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImsTopicsRepo extends JpaRepository<ImsTopics, String> {
    List<ImsTopics> findByChapterIdOrderByOrderIndexAsc(String chapterId);
}
