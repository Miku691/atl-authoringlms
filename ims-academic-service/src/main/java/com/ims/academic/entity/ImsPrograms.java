package com.ims.academic.entity;

import com.ims.academic.enums.AcademicBoard;
import com.ims.academic.enums.ProgramLevel;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.List;

@Entity
@Table(
        name = "IMS_PROGRAMS",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_program_code_tenant",
                        columnNames = {"tenant_id", "code"}
                )
        },
        indexes = {
                @Index(name = "idx_program_tenant", columnList = "tenant_id"),
                @Index(name = "idx_program_level", columnList = "level")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsPrograms {

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

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "code", length = 64, nullable = false)
    private String code;

    @Column(name = "title", length = 255, nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", length = 50, nullable = false)
    private ProgramLevel level;

    @Enumerated(EnumType.STRING)
    @Column(name = "board", length = 100)
    private AcademicBoard board;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    // Program → Offerings (Class / Batch / Degree Instance)
     @OneToMany(mappedBy = "program", fetch = FetchType.LAZY)
     private List<ImsOfferings> offerings;

    // Program → Subjects
     @OneToMany(mappedBy = "program", fetch = FetchType.LAZY)
     private List<ImsSubjects> subjects;

    // Program → Academic Years
     @OneToMany(mappedBy = "program", fetch = FetchType.LAZY)
     private List<ImsAcademicYears> academicYears;
}

