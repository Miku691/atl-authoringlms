package com.ims.academic.repo;

import com.ims.academic.entity.ImsChapters;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsChaptersRepo extends JpaRepository<ImsChapters, String> {

    List<ImsChapters> findBySyllabusPackId(String syllabusPackId);
}
