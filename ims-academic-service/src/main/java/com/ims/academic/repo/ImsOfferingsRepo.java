package com.ims.academic.repo;

import com.ims.academic.entity.ImsOfferings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ImsOfferingsRepo extends JpaRepository<ImsOfferings, String> {

    List<ImsOfferings> findByTenantId(String tenantId);

    List<ImsOfferings> findBySession_ProgramId(String programId);

    List<ImsOfferings> findBySessionId(String sessionId);

    java.util.Optional<ImsOfferings> findByNameAndSessionId(String name, String sessionId);

    @Query("SELECT o FROM ImsOfferings o WHERE o.name = :name AND o.session.id = :sessionId " +
           "AND ((:classId IS NULL AND o.classId IS NULL) OR o.classId = :classId) " +
           "AND ((:yearId IS NULL AND o.yearId IS NULL) OR o.yearId = :yearId) " +
           "AND ((:courseId IS NULL AND o.courseId IS NULL) OR o.courseId = :courseId)")
    List<ImsOfferings> findExactDuplicate(@Param("name") String name, 
                                          @Param("sessionId") String sessionId,
                                          @Param("classId") String classId,
                                          @Param("yearId") String yearId,
                                          @Param("courseId") String courseId);

    @Query("SELECT o FROM ImsOfferings o WHERE o.id IN (SELECT oi.offeringId FROM ImsOfferingInstructors oi WHERE oi.instructorId = :instructorId)")
    List<ImsOfferings> findByInstructorId(@Param("instructorId") String instructorId);

    long countByTenantId(String tenantId);
}
