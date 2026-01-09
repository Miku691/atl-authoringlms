package com.ims.academic.repo;

import com.ims.academic.entity.ImsSyllabusItems;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsSyllabusItemsRepo extends JpaRepository<ImsSyllabusItems, String> {

    List<ImsSyllabusItems> findByChapterId(String chapterId);
}
