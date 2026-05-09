package com.ims.academic.repository;

import com.ims.academic.entity.ImsCourses;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImsCoursesRepository extends JpaRepository<ImsCourses, String> {
    List<ImsCourses> findByTenantId(String tenantId);
    List<ImsCourses> findByTenantIdAndProgramId(String tenantId, String programId);
}
