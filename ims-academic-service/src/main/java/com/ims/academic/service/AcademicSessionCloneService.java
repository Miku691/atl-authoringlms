package com.ims.academic.service;

public interface AcademicSessionCloneService {
    /**
     * Clones the academic structure (Offerings, Subject Mappings) from a source session to a target session.
     * 
     * @param sourceSessionId The ID of the session to clone from.
     * @param targetSessionId The ID of the newly created session.
     * @param tenantId The tenant ID for security context.
     */
    void cloneStructure(String sourceSessionId, String targetSessionId, String tenantId);
}
