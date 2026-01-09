package com.ims.academic.repo;

import com.ims.academic.entity.ImsTimetableEntries;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsTimetableEntriesRepo extends JpaRepository<ImsTimetableEntries, String> {
    List<ImsTimetableEntries> findByTimetableSlotId(String timetableSlotId);
}
