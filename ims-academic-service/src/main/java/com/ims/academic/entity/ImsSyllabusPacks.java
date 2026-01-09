package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "IMS_SYLLABUS_PACKS")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsSyllabusPacks {

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

    @Column(name = "tenant_id")
    private String tenantId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "board", length = 100)
    private String board;
}
