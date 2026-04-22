package com.ims.academic.entity;

import com.ims.academic.enums.OfferingType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;

@Entity
@Table(name = "IMS_OFFERINGS", indexes = {
        @Index(name = "idx_offering_tenant", columnList = "tenant_id"),
        @Index(name = "idx_offering_type", columnList = "type")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsOfferings {

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

    // Tenant reference (NO JPA join)
    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    // Session reference (Session belongs to Program)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private AcademicSession session;

    // Optional: Keep program for faster querying if needed, but strict hierarchy
    // suggests via session.
    // For now, valid Offering must belong to a session.

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private OfferingType type;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "capacity")
    private Integer capacity;

    // Flexible config (semester_no, section, shift, etc.)
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    // Link to Class (especially for College/Coaching where Semesters directly link to Years)
    @Column(name = "class_id")
    private String classId;
}
