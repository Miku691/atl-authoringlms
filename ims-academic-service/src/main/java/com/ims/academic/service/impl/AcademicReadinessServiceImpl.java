package com.ims.academic.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ims.academic.dto.AcademicReadinessDto;
import com.ims.academic.entity.ImsClasses;
import com.ims.academic.repo.*;
import com.ims.academic.service.AcademicReadinessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AcademicReadinessServiceImpl implements AcademicReadinessService {

    private final ImsProgramsRepo programsRepo;
    private final ImsAcademicYearsRepo academicYearsRepo;
    private final ImsTenantSettingsRepo tenantSettingsRepo;
    private final ImsClassesRepo classesRepo;
    private final ImsOfferingSubjectsRepo offeringSubjectsRepo;
    private final ObjectMapper objectMapper;

    @Override
    public AcademicReadinessDto checkReadiness(String tenantId) {
        List<String> missingComponents = new ArrayList<>();
        boolean isReady = true;

        // 1. Check Program
        long programCount = programsRepo.countByTenantId(tenantId);
        if (programCount == 0) {
            missingComponents.add("PROGRAM");
            isReady = false;
        }

        // 2. Check Academic Year
        long yearCount = academicYearsRepo.countByTenantId(tenantId);
        if (yearCount == 0) {
            missingComponents.add("ACADEMIC_YEAR");
            isReady = false;
        }

        // 3. Check Enabled Classes & Offerings
        // Fetch Tenant Settings
        List<String> enabledClasses = getEnabledClasses(tenantId);
        if (enabledClasses == null || enabledClasses.isEmpty()) {
            // Note: If no classes enabled, technically readiness might be failed or just 0
            // classes.
            // Assuming at least one class is required for a school.
            missingComponents.add("TENANT_SETTINGS_CLASSES_CONFIG");
            isReady = false;
        } else {
            for (String className : enabledClasses) {
                // Find Class by Name
                Optional<ImsClasses> classEntity = classesRepo.findByTenantId(tenantId).stream()
                        .filter(c -> c.getName().equalsIgnoreCase(className))
                        .findFirst();

                if (classEntity.isEmpty()) {
                    missingComponents.add("CLASS_MISSING_" + className);
                    isReady = false;
                } else {
                    // Class exists, implies Offering exists (FK).
                    // Verify Subject Mapping
                    ImsClasses imsClass = classEntity.get();
                    if (imsClass.getOffering() == null) {
                        // Should not happen with nullable=false, but good to check
                        missingComponents.add("OFFERING_MISSING_FOR_" + className);
                        isReady = false;
                    } else {
                        boolean hasSubjects = offeringSubjectsRepo
                                .existsByOfferingIdAndSubjectId(imsClass.getOffering().getId(), null);
                        // Wait, existsByOfferingIdAndSubjectId checks specific subject.
                        // We need "exists ANY subject".
                        // Use findByOfferingId and check size > 0
                        boolean hasAnySubjects = !offeringSubjectsRepo.findByOfferingId(imsClass.getOffering().getId())
                                .isEmpty();

                        if (!hasAnySubjects) {
                            missingComponents.add("SUBJECT_MAPPING_MISSING_" + className);
                            isReady = false;
                        }
                    }
                }
            }
        }

        return AcademicReadinessDto.builder()
                .isReady(isReady)
                .tenantType("SCHOOL") // Hardcoded as logic is currently for School
                .missingComponents(missingComponents)
                .build();
    }

    private List<String> getEnabledClasses(String tenantId) {
        return tenantSettingsRepo.findById(tenantId)
                .map(settings -> {
                    try {
                        if (settings.getSettings() == null)
                            return new ArrayList<String>();
                        JsonNode root = objectMapper.readTree(settings.getSettings());

                        // Try "activeClasses" or "enabledClasses"
                        JsonNode classesNode = root.get("activeClasses");
                        if (classesNode == null) {
                            classesNode = root.get("enabledClasses");
                        }

                        if (classesNode != null && classesNode.isArray()) {
                            return objectMapper.convertValue(classesNode, new TypeReference<List<String>>() {
                            });
                        }
                        return new ArrayList<String>();
                    } catch (Exception e) {
                        log.error("Failed to parse tenant settings for tenant: {}", tenantId, e);
                        return new ArrayList<String>();
                    }
                })
                .orElse(new ArrayList<>());
    }
}
