package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "IMS_ATTENDANCE_RECORDS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsAttendanceRecords {

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
    @JoinColumn(name = "attendance_master_id", nullable = false)
    @ToString.Exclude
    private ImsAttendanceMaster attendanceMaster;

    @Column(name = "student_id", nullable = false)
    private String studentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private com.ims.academic.enums.AttendanceStatus status;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;
}
