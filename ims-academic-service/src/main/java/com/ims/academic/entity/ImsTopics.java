package com.ims.academic.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

@Entity
@Table(name = "IMS_TOPICS", indexes = {
        @Index(name = "idx_topic_chapter", columnList = "chapter_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImsTopics {

    @Id
    @GeneratedValue
    @UuidGenerator
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chapter_id", nullable = false)
    private ImsChapters chapter;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "order_index")
    private Integer orderIndex;
}
