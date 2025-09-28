package com.authoring.tool.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name  =  "ATL_SLIDES")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtlSlides {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String title;
	private String desc;
	private Integer index;
	
	@ManyToOne
	@JoinColumn(name = "course_id")
	private AtlCourse course;
	
	@OneToMany(mappedBy = "slide", cascade = CascadeType.ALL, orphanRemoval = true)
	private List<AtlSlideComponent> components = new ArrayList<>();
}
