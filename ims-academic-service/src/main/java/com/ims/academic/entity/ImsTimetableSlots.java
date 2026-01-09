package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "IMS_TIMETABLE_SLOTS")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsTimetableSlots {

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
    @JoinColumn(name = "timetable_master_id", nullable = false)
    @ToString.Exclude
    private ImsTimetableMasters timetableMaster;

    @Column(name = "day_of_week")
    private Integer dayOfWeek;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "slot_label", length = 100)
    private String slotLabel;

    @OneToMany(mappedBy = "timetableSlot", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ImsTimetableEntries> entries;
}
