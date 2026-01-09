package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "IMS_ATTENDANCE_MASTER")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsAttendanceMaster {

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

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "status", length = 20)
    private String status;

    @Column(name = "taken_by")
    private String takenBy;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @OneToMany(mappedBy = "attendanceMaster", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ImsAttendanceRecords> records;
}
