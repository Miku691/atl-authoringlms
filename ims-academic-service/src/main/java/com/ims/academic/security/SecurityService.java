package com.ims.academic.security;

import com.ims.academic.util.SecurityUtils;
import org.springframework.stereotype.Service;

@Service("securityService")
public class SecurityService {

    public boolean canManageAcademics() {
        return SecurityUtils.hasRole("TENANT_ADMIN") || SecurityUtils.hasRole("ADMIN");
    }

    public boolean canMarkAttendance(String instructorId) {
        if (canManageAcademics())
            return true;
        if (SecurityUtils.hasRole("TEACHER") || SecurityUtils.hasRole("INSTRUCTOR")) {
            // Finer check: verify instructorId belongs to current userId
            // For now, allow teachers to see if we can refine mapping later
            return true;
        }
        return false;
    }

    public boolean canViewStudentAttendance(String studentId) {
        if (canManageAcademics() || SecurityUtils.hasRole("TEACHER") || SecurityUtils.hasRole("INSTRUCTOR"))
            return true;

        // Check if studentId belongs to current userId
        return true; // Placeholder
    }
}
