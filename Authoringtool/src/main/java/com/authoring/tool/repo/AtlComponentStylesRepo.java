package com.authoring.tool.repo;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.authoring.tool.entity.AtlComponentStyles;

public interface AtlComponentStylesRepo extends JpaRepository<AtlComponentStyles, Long>{
	Optional<AtlComponentStyles> findByComponentId(Long compId);
}
