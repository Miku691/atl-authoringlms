package com.authoring.tool.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "ATL_COMPONENT_MCQ")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtlComponentMcq extends AtlSlideComponent{
    private String mcqId;
}
