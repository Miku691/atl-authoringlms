package com.authoring.tool.entity;

import java.time.LocalDate;
import java.util.regex.Pattern;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ATL_COMPONENT_STYLES")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class AtlComponentStyles {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

    @Column(unique = true)
	private Long componentId;
	private String componentType;
	private String styleJson;
	@CreatedDate
	private LocalDate createdOn;
}