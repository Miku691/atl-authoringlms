package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "IMS_ASSIGNMENTS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsAssignments {

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

    @Column(name = "offering_id")
    private String offeringId;

    @Column(name = "subject_id")
    private String subjectId;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "due_date")
    private LocalDateTime dueDate;

    @Column(name = "created_by")
    private String createdBy;

    @OneToMany(mappedBy = "assignment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ImsAssignmentSubmissions> submissions;
}
