package com.ims.student.security;

import com.ims.student.repo.ImsStudentsRepo;
import com.ims.student.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service("securityService")
@RequiredArgsConstructor
public class SecurityService {

    private final ImsStudentsRepo studentRepo;

    public boolean isSelf(String studentId) {
        String currentPrincipal = SecurityUtils.getCurrentUserId(); 
        if (currentPrincipal == null)
            return false;

        return studentRepo.findById(studentId)
                .map(student -> currentPrincipal.equalsIgnoreCase(student.getEmail()) || 
                               currentPrincipal.equals(student.getUserId()))
                .orElse(false);
    }

    public boolean canManageStudent() {
        return SecurityUtils.hasRole("TENANT_ADMIN") || SecurityUtils.hasRole("ADMIN");
    }

    public boolean canViewStudent(String studentId) {
        if (canManageStudent())
            return true;
        if (SecurityUtils.hasRole("TEACHER"))
            return true; // Finer check later
        return isSelf(studentId);
    }
}
