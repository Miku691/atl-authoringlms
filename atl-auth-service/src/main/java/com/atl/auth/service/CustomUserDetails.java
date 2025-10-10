package com.atl.auth.service;

import com.atl.auth.entity.AtlUser;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;


@Getter
public class CustomUserDetails implements UserDetails {
    private final AtlUser atlUser;

    public CustomUserDetails(AtlUser atlUser) {
        this.atlUser = atlUser;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of();
    }
    @Override
    public String getPassword() {
        return atlUser.getPassword();
    }
    @Override
    public String getUsername() {
        return atlUser.getUsername();
    }
}
