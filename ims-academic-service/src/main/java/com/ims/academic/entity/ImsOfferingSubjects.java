package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.math.BigDecimal;

@Entity
@Table(name = "IMS_OFFERING_SUBJECTS")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsOfferingSubjects {

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

    @Column(name = "offering_id", nullable = false)
    private String offeringId;

    @Column(name = "subject_id", nullable = false)
    private String subjectId;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(name = "weight", precision = 5, scale = 2)
    private BigDecimal weight;
}
