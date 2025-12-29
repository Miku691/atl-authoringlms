package com.ims.academic.entity;

import com.ims.academic.enums.SubjectType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(
        name = "IMS_SUBJECTS",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"code"}),
                @UniqueConstraint(columnNames = {"title"})
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImsSubjects {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @Column(nullable = false, length = 64)
    private String code;

    @Column(nullable = false, length = 255)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "subject_type", nullable = false, length = 50)
    private SubjectType subjectType;

    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
