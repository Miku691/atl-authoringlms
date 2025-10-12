package com.atl.auth.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ATL_ROLE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtlRole {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false)
    private String roleName;
}
