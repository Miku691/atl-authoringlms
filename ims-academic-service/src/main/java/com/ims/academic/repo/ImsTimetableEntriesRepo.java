package com.ims.academic.repo;

import com.ims.academic.entity.ImsTimetableEntries;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsTimetableEntriesRepo extends JpaRepository<ImsTimetableEntries, String> {
    List<ImsTimetableEntries> findByTimetableSlotId(String timetableSlotId);

    List<ImsTimetableEntries> findByInstructorId(String instructorId);

    boolean existsByTimetableSlotIdAndOfferingIdAndSubjectIdAndInstructorIdAndTenantId(String timetableSlotId,
            String offeringId,
            String subjectId, String instructorId, String tenantId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(e) > 0 FROM ImsTimetableEntries e " +
            "JOIN e.timetableSlot s " +
            "WHERE e.instructorId = :instructorId " +
            "AND s.dayOfWeek = :dayOfWeek " +
            "AND s.startTime < :endTime " +
            "AND s.endTime > :startTime " +
            "AND (:excludeEntryId IS NULL OR e.id <> :excludeEntryId)")
    boolean isInstructorBusy(@org.springframework.data.repository.query.Param("instructorId") String instructorId,
            @org.springframework.data.repository.query.Param("dayOfWeek") Integer dayOfWeek,
            @org.springframework.data.repository.query.Param("startTime") java.time.LocalTime startTime,
            @org.springframework.data.repository.query.Param("endTime") java.time.LocalTime endTime,
            @org.springframework.data.repository.query.Param("excludeEntryId") String excludeEntryId);
}
