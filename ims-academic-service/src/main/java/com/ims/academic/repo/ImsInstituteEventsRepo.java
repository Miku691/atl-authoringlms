package com.ims.academic.repo;

import com.ims.academic.entity.ImsInstituteEvents;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ImsInstituteEventsRepo extends JpaRepository<ImsInstituteEvents, String> {
    List<ImsInstituteEvents> findByTenantIdAndEndDateAfterAndStartDateBefore(
            String tenantId, LocalDateTime start, LocalDateTime end);
    
    List<ImsInstituteEvents> findByTenantId(String tenantId);
}
