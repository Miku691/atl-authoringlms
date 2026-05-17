package com.ims.academic.repo;

import com.ims.academic.entity.ImsAnnouncement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ImsAnnouncementRepo extends JpaRepository<ImsAnnouncement, String> {

    List<ImsAnnouncement> findByTenantIdOrderByCreatedAtDesc(String tenantId);

    @Query("SELECT a FROM ImsAnnouncement a WHERE a.tenantId = :tenantId AND (a.targetAudience = 'ALL' OR a.targetAudience = :audience) AND (a.expiryDate IS NULL OR a.expiryDate > :now) ORDER BY a.createdAt DESC")
    List<ImsAnnouncement> findActiveByAudience(String tenantId, String audience, LocalDateTime now);

    @Query("SELECT a FROM ImsAnnouncement a WHERE a.tenantId = :tenantId " +
           "AND (:audience IS NULL OR :audience = '' OR a.targetAudience = :audience) " +
           "AND (:priority IS NULL OR :priority = '' OR a.priority = :priority) " +
           "AND (:search IS NULL OR :search = '' OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.content) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY a.createdAt DESC")
    List<ImsAnnouncement> findFilteredAnnouncements(String tenantId, String audience, String priority, String search);
}
