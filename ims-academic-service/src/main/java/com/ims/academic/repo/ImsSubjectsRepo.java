package com.ims.academic.repo;

import com.ims.academic.entity.ImsSubjects;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImsSubjectsRepo extends JpaRepository<ImsSubjects, String> {

    boolean existsByCode(String code);

    boolean existsByTitle(String title);
}
