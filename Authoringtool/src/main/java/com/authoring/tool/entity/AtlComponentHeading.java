package com.authoring.tool.entity;


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
@Table(name = "ATL_COMPONENT_HEADING")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AtlComponentHeading extends AtlSlideComponent{
	private String title;


}
