package com.ims.academic.entity;

import com.ims.academic.enums.SubjectType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.UUID;

@Entity
@Table(name = "IMS_SUBJECTS", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "tenant_id", "code" }),
        @UniqueConstraint(columnNames = { "tenant_id", "title" })
})
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

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(nullable = false, length = 64)
    private String code;

    @Column(nullable = false, length = 255)
    private String title;

    public String getName() {
        return title;
    }

    public void setName(String name) {
        this.title = name;
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "subject_type", nullable = false, length = 50)
    private SubjectType subjectType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "program_id", nullable = true)
    private ImsPrograms program;

    @Column(name = "total_exam_marks")
    private Integer totalExamMarks;

    @PrePersist
    protected void onCreate() {
        if (this.id == null || this.id.isEmpty()) {
            this.id = UUID.randomUUID().toString();
        }
    }
}
