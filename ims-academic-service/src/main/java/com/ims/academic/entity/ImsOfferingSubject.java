package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "IMS_OFFERING_SUBJECTS", indexes = {
                @Index(name = "idx_os_offering", columnList = "offering_id"),
                @Index(name = "idx_os_subject", columnList = "subject_id")
}, uniqueConstraints = {
                @UniqueConstraint(name = "uk_offering_subject", columnNames = { "offering_id", "subject_id" })
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsOfferingSubject {

        @Id
        @GeneratedValue
        @UuidGenerator
        private String id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "offering_id", nullable = false)
        private ImsOfferings offering;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "subject_id", nullable = false)
        private ImsSubjects subject;

        @Column(name = "is_optional")
        private boolean isOptional;

        @Column(name = "credits")
        private Double credits; // Override default credits if needed

        // Logic: Default instructor for this subject in this offering
        @Column(name = "instructor_id")
        private String instructorId;
}
