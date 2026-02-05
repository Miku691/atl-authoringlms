package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "IMS_TIMETABLE_ENTRIES")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsTimetableEntries {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = java.util.UUID.randomUUID().toString();
        }
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "timetable_slot_id", nullable = false)
    @ToString.Exclude
    private ImsTimetableSlots timetableSlot;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "offering_id")
    private String offeringId;

    @Column(name = "subject_id")
    private String subjectId;

    @Column(name = "instructor_id")
    private String instructorId;

    @Column(name = "room", length = 100)
    private String room;
}
