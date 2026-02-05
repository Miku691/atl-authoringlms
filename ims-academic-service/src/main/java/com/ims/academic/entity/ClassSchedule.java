package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalTime;
import java.time.DayOfWeek;

@Entity
@Table(name = "IMS_CLASS_SCHEDULES", indexes = {
        @Index(name = "idx_cs_offering", columnList = "offering_id"),
        @Index(name = "idx_cs_day", columnList = "day_of_week")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassSchedule {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offering_id", nullable = false)
    private ImsOfferings offering;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private ImsSubjects subject; // Likely comes via OfferingSubject, but direct link for query speed

    @Enumerated(EnumType.STRING)
    @Column(name = "day_of_week", nullable = false)
    private DayOfWeek dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "room_number")
    private String roomNumber;

    @Column(name = "instructor_id")
    private String instructorId; // Override OfferingSubject default if needed
}
