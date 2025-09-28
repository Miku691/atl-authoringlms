package com.authoring.tool.entity;

import java.time.LocalDate;
import java.util.regex.Pattern;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
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
public class AtlComponentStyles {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private Long componentId;
	private String componentType;
	private String styleJson;
	private LocalDate createdOn;
}
