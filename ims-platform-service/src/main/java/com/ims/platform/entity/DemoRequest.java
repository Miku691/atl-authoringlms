package com.ims.platform.entity;

import com.ims.platform.enums.DemoRequestStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "demo_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemoRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String phoneNumber;

    private String instituteName;

    private String estimatedStudents;

    @Column(nullable = false)
    private LocalDate preferredDate;

    @Column(nullable = false)
    private LocalTime preferredTime;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private DemoRequestStatus status = DemoRequestStatus.PENDING;

    @Column(length = 1000)
    private String meetingLink;

    @Column(columnDefinition = "TEXT")
    private String adminFeedback;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
