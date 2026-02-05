package com.ims.academic.repo;

import com.ims.academic.entity.ClassSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassScheduleRepo extends JpaRepository<ClassSchedule, String> {
    List<ClassSchedule> findByOfferingId(String offeringId);

    List<ClassSchedule> findByTenantId(String tenantId);
}
