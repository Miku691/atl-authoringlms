package com.atl.auth.service;

import com.atl.auth.entity.AtlRole;
import com.atl.auth.repo.AtlRoleRepo;
import lombok.Builder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AtlRoleService {
    private final AtlRoleRepo roleRepo;

    public Set<AtlRole> setDefaultRole(String defaultRole) {
        Optional<AtlRole> isRoleExist = roleRepo.findByRoleName(defaultRole);
        if (isRoleExist.isPresent()) return Set.of(isRoleExist.get());

        AtlRole atlRole = roleRepo.save(AtlRole.builder().roleName(defaultRole).build());
        return Set.of(atlRole);
    }
}
