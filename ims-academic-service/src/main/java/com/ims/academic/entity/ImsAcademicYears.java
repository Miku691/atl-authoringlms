package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDate;

@Entity
@Table(name = "IMS_ACADEMIC_YEARS", uniqueConstraints = {
        @UniqueConstraint(name = "uk_academic_year_tenant_label", columnNames = { "tenant_id", "label" })
}, indexes = {
        @Index(name = "idx_academic_year_tenant", columnList = "tenant_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsAcademicYears {

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

    @Column(name = "label", nullable = false, length = 30)
    private String label;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = false)
    private ImsPrograms program;
}
