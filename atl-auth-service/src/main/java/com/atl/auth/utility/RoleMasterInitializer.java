package com.atl.auth.utility;

import com.atl.auth.entity.RoleMaster;
import com.atl.auth.repo.RoleMasterRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RoleMasterInitializer implements ApplicationRunner {
    private final RoleMasterRepo roleMasterRepo;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        createRoleIfNotExists("SUPER_ADMIN", "Super Admin");
        createRoleIfNotExists("TENANT_ADMIN", "Tenant Admin");
        createRoleIfNotExists("TEACHER", "Teacher");
        createRoleIfNotExists("STUDENT", "Student");
        createRoleIfNotExists("PARENT", "Parent");
        createRoleIfNotExists("LIBRARIAN", "Librarian");
        createRoleIfNotExists("ACCOUNTANT", "Accountant");
        createRoleIfNotExists("HR_MANAGER", "HR Manager");
    }

    private void createRoleIfNotExists(String roleCode, String roleName) {
        if (!roleMasterRepo.existsByRoleCode(roleCode)) {
            roleMasterRepo.save(
                    RoleMaster.builder()
                            .roleCode(roleCode)
                            .roleName(roleName)
                            .build()
            );
        }
    }
}
