package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;

@Entity
@Table(name = "IMS_INSTITUTE_EVENTS")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsInstituteEvents {

    @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(length = 36)
    private String id;

    @Column(nullable = false)
    private String tenantId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Column(nullable = false)
    private String type; // HOLIDAY, EVENT, MEETING, EXAM, OTHER

    @Column(nullable = false)
    private String targetAudience; // ALL, TEACHER, STUDENT, ADMIN

    private boolean isFullDay;

    private String color; // Hex code or named color (e.g. #FF5733)

    private String location;

    private String createdBy;

    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
