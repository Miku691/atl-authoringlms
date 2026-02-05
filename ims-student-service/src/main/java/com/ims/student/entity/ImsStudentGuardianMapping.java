package com.ims.student.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "IMS_STUDENT_GUARDIAN_MAPPING", indexes = {
                @Index(name = "idx_mapping_student", columnList = "student_id"),
                @Index(name = "idx_mapping_guardian", columnList = "guardian_id"),
                @Index(name = "idx_mapping_tenant", columnList = "tenant_id")
}, uniqueConstraints = {
                @UniqueConstraint(name = "uk_student_guardian", columnNames = { "student_id", "guardian_id" })
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsStudentGuardianMapping {

        @Id
        @GeneratedValue
        @UuidGenerator
        private String id;

        @Column(name = "tenant_id", nullable = false)
        private String tenantId;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "student_id", nullable = false)
        private ImsStudents student;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "guardian_id", nullable = false)
        private ImsGuardians guardian;

        @Column(name = "relation", nullable = false)
        private String relation; // FATHER, MOTHER, GUARDIAN

        @Column(name = "is_primary")
        @Builder.Default
        private boolean isPrimary = false;
}
