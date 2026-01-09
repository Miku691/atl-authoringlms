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

    @Column(name = "syllabus_pack_id", nullable = false)
    private String syllabusPackId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "order_index")
    private Integer orderIndex;
}
