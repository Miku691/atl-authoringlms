package com.ims.instructor.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalTime;

@Entity
@Table(name = "IMS_INSTRUCTOR_AVAILABILITY", indexes = {
        @Index(name = "idx_avail_instructor", columnList = "instructor_id"),
        @Index(name = "idx_avail_day", columnList = "day_of_week")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsInstructorAvailability {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(name = "instructor_id", nullable = false)
    private String instructorId;

    @Column(name = "day_of_week", nullable = false)
    private String dayOfWeek; // MONDAY, TUESDAY, etc.

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "is_available")
    @Builder.Default
    private boolean isAvailable = true; // True = Preferred slot, False = Blocked slot

    @Column(name = "notes")
    private String notes;
}
