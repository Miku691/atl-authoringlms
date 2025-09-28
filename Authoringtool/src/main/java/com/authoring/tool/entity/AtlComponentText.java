package com.authoring.tool.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ATL_COMPONENT_TEXT")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AtlComponentText extends AtlSlideComponent{
	private String text;
}
