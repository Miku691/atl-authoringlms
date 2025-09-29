package com.atl.auth.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ATL_USER")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AtlUser {
    private Long id;
    private String userName;
    private String password;
}
