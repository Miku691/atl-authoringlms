package com.atl.auth.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ROLE_MASTER")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleMaster {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String roleCode;

    @Column(nullable = false)
    private String roleName;
}
