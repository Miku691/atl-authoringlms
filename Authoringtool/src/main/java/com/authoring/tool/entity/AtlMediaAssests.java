package com.authoring.tool.entity;

import java.time.LocalDate;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Table(name = "ATL_MEDIA_ASSETS")
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtlMediaAssests {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	private String fileName;
	private String fileUrl;
	private String fileType;
	private String uploadedBy;
	private LocalDate uploadedOn;
}
