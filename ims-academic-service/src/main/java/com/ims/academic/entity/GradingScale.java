package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

/**
 * Entity to store tenant-level grading scales (e.g., A+ = 80-100%).
 */
@Entity
@Table(name = "IMS_GRADING_SCALE", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "tenant_id", "grade_label" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GradingScale {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "grade_label", nullable = false, length = 10)
    private String gradeLabel; // e.g., A+, B, C

    @Column(name = "min_percentage", nullable = false)
    private Double minPercentage;

    @Column(name = "max_percentage", nullable = false)
    private Double maxPercentage;

    @Column(name = "grade_point", nullable = false)
    private Double gradePoint; // e.g., 4.0, 3.5

    @Column(name = "description")
    private String description;

    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = java.util.UUID.randomUUID().toString();
        }
    }
}
