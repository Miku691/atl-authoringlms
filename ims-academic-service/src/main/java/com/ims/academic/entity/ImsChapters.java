package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "IMS_CHAPTERS")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsChapters {

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "offering_subject_id", nullable = true)
    private ImsOfferingSubject offeringSubject;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(name = "level_id")
    private String levelId;

    @Column(name = "subject_id")
    private String subjectId;
}
