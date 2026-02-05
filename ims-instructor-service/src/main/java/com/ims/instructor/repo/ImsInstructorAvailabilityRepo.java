package com.ims.instructor.repo;

import com.ims.instructor.entity.ImsInstructorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImsInstructorAvailabilityRepo extends JpaRepository<ImsInstructorAvailability, String> {
    List<ImsInstructorAvailability> findByInstructorId(String instructorId);

    List<ImsInstructorAvailability> findByInstructorIdAndDayOfWeek(String instructorId, String dayOfWeek);
}
