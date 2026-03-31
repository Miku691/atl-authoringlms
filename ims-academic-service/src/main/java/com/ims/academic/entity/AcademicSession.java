package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDate;
import java.util.List;

/**
 * Represents an Academic Session (e.g., 2025-26).
 * Manages the lifecycle and state of a specific academic period.
 */
@Entity
@Table(name = "IMS_ACADEMIC_SESSIONS", indexes = {
        @Index(name = "idx_session_tenant", columnList = "tenant_id"),
        @Index(name = "idx_session_program", columnList = "program_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AcademicSession {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "name", nullable = false)
    private String name; // e.g. "2025-2026", "Spring 2025"

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "is_current")
    private boolean isCurrent;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SessionStatus status = SessionStatus.DRAFT;

    @Column(name = "is_locked")
    private boolean isLocked = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    private ImsPrograms program;

    @OneToMany(mappedBy = "session", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ImsOfferings> offerings;

    public enum SessionStatus {
        DRAFT, ENROLLMENT_OPEN, ACTIVE, YEP, CLOSED
    }
}
