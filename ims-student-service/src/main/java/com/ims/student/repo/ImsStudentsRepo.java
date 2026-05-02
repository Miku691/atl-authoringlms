package com.ims.student.repo;

import com.ims.student.entity.ImsStudents;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ImsStudentsRepo extends JpaRepository<ImsStudents, String> {
    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsByAdmissionNo(String admissionNo);

    Optional<ImsStudents> findByEmail(String email);

    List<ImsStudents> findByTenantId(String tenantId);

    Optional<ImsStudents> findByUserId(String userId);

    Optional<ImsStudents> findByEmailAndTenantId(String email, String tenantId);

    long countByTenantId(String tenantId);

    @Query("SELECT s.gender as gender, COUNT(s) as count FROM ImsStudents s WHERE s.tenantId = :tenantId AND (s.isDeleted IS NULL OR s.isDeleted = false) GROUP BY s.gender")
    List<Map<String, Object>> countByGender(String tenantId);

    @Query("SELECT DISTINCT s FROM ImsStudents s " +
            "LEFT JOIN ImsStudentEnrollments e ON s.id = e.studentId " +
            "WHERE s.tenantId = :tenantId " +
            "AND (cast(:gender as String) IS NULL OR s.gender = cast(:gender as String)) " +
            "AND (cast(:offeringId as String) IS NULL OR (e.offeringId = cast(:offeringId as String) AND e.status = 'ACTIVE' AND (e.isDeleted IS NULL OR e.isDeleted = false))) " +
            "AND (cast(:searchTerm as String) IS NULL OR LOWER(s.firstName) LIKE LOWER(CONCAT('%', cast(:searchTerm as String), '%')) " +
            "     OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', cast(:searchTerm as String), '%')) " +
            "     OR LOWER(s.admissionNo) LIKE LOWER(CONCAT('%', cast(:searchTerm as String), '%'))) " +
            "AND (s.isDeleted IS NULL OR s.isDeleted = false)")
    Page<ImsStudents> searchStudents(
            @Param("tenantId") String tenantId,
            @Param("gender") String gender,
            @Param("offeringId") String offeringId,
            @Param("searchTerm") String searchTerm,
            Pageable pageable);

    @Query("SELECT DISTINCT s FROM ImsStudents s " +
            "JOIN ImsStudentEnrollments e ON s.id = e.studentId " +
            "WHERE s.tenantId = :tenantId " +
            "AND e.offeringId = :offeringId " +
            "AND e.status = 'ACTIVE' " +
            "AND (e.isDeleted IS NULL OR e.isDeleted = false) " +
            "AND (s.isDeleted IS NULL OR s.isDeleted = false)")
    List<ImsStudents> findByOffering(String tenantId, String offeringId);

    @Query("SELECT DISTINCT s FROM ImsStudents s " +
            "JOIN ImsStudentEnrollments e ON s.id = e.studentId " +
            "WHERE s.tenantId = :tenantId " +
            "AND e.offeringId IN :offeringIds " +
            "AND e.status = 'ACTIVE' " +
            "AND (e.isDeleted IS NULL OR e.isDeleted = false) " +
            "AND (s.isDeleted IS NULL OR s.isDeleted = false)")
    List<ImsStudents> findByOfferingIn(String tenantId, List<String> offeringIds);
}
