package com.ims.academic.repo;

import com.ims.academic.entity.ImsTimetableSlots;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsTimetableSlotsRepo extends JpaRepository<ImsTimetableSlots, String> {
    List<ImsTimetableSlots> findByTimetableMasterId(String timetableMasterId);
}
