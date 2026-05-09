package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "IMS_COURSES", uniqueConstraints = {
        @UniqueConstraint(name = "uk_course_name_tenant", columnNames = {"tenant_id", "program_id", "name"})
}, indexes = {
        @Index(name = "idx_course_tenant", columnList = "tenant_id"),
        @Index(name = "idx_course_program", columnList = "program_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsCourses {

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

    @Column(name = "program_id", nullable = false)
    private String programId;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "code", length = 32)
    private String code;
}
