package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.util.List;

@Entity
@Table(name = "IMS_TIMETABLE_MASTERS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsTimetableMasters {

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

    @Column(name = "offering_id", nullable = false)
    private String offeringId;

    @Column(name = "academic_year_id", nullable = false)
    private String academicYearId;

    @Column(name = "name", length = 255)
    private String name;

    @Column(name = "timezone", length = 64)
    private String timezone;

    @OneToMany(mappedBy = "timetableMaster", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ImsTimetableSlots> slots;
}
