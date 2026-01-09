package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "IMS_OFFERING_INSTRUCTORS")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsOfferingInstructors {

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

    @Column(name = "offering_id", nullable = false)
    private String offeringId;

    @Column(name = "instructor_id", nullable = false)
    private String instructorId;

    @Column(name = "subject_id")
    private String subjectId;

    @Column(name = "role", length = 50)
    private String role;

    @Column(name = "start_date")
    private java.time.LocalDate startDate;

    @Column(name = "end_date")
    private java.time.LocalDate endDate;
}
