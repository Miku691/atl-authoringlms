package com.ims.academic.entity;

import com.ims.academic.enums.CoverageStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.time.Instant;

@Entity
@Table(name = "IMS_SYLLABUS_COVERAGE", indexes = {
                @Index(name = "idx_coverage_offering_subject", columnList = "offering_subject_id"),
                @Index(name = "idx_coverage_topic", columnList = "topic_id")
}, uniqueConstraints = {
                @UniqueConstraint(name = "uk_coverage_offering_topic", columnNames = { "offering_subject_id",
                                "topic_id" })
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SyllabusCoverage {

        @Id
        @GeneratedValue
        @UuidGenerator
        private String id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "offering_subject_id", nullable = false)
        private ImsOfferingSubject offeringSubject;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "topic_id", nullable = false)
        private ImsTopics topic;

        @Enumerated(EnumType.STRING)
        @Column(name = "status", nullable = false)
        private CoverageStatus status;

        @Column(name = "completed_at")
        private Instant completedAt;

        @Column(name = "completed_by")
        private String completedBy; // Instructor ID
}
