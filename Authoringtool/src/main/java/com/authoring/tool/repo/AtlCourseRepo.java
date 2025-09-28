package com.authoring.tool.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.authoring.tool.entity.AtlCourse;

public interface AtlCourseRepo extends JpaRepository<AtlCourse, Long>{
    Page<AtlCourse> findAll(Pageable pageable);
}
