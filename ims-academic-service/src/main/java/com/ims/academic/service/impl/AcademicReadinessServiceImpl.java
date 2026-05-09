package com.ims.academic.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ims.academic.dto.AcademicReadinessDto;

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
    private final com.ims.academic.repo.AcademicSessionRepo academicSessionRepo;
    private final ImsOfferingSubjectRepo offeringSubjectsRepo;
    private final ImsOfferingsRepo offeringsRepo;
    private final ObjectMapper objectMapper;

    @Override
    public AcademicReadinessDto checkReadiness(String tenantId) {
        List<String> missingComponents = new ArrayList<>();
        boolean isReady = true;

        // Determine tenant type from programs
        String tenantType = "SCHOOL"; // Default
        List<com.ims.academic.entity.ImsPrograms> programs = programsRepo.findByTenantId(tenantId);
        
        long programCount = programs.size();
        if (programCount == 0) {
            missingComponents.add("PROGRAM");
            isReady = false;
        } else {
            String level = programs.get(0).getLevel().name();
            if ("COACHING".equalsIgnoreCase(level)) {
                tenantType = "COACHING";
            } else if ("UNDERGRAD".equalsIgnoreCase(level) || "POSTGRAD".equalsIgnoreCase(level) || "DIPLOMA".equalsIgnoreCase(level)) {
                tenantType = "COLLEGE";
            }
        }

        // Check Academic Session
        long sessionCount = academicSessionRepo.findByTenantId(tenantId).size();
        if (sessionCount == 0) {
            missingComponents.add("ACADEMIC_SESSION");
            isReady = false;
        }

        // Generic Offering Check
        List<com.ims.academic.entity.ImsOfferings> offerings = offeringsRepo.findByTenantId(tenantId);
        
        if (offerings.isEmpty()) {
            if ("SCHOOL".equals(tenantType)) {
                 missingComponents.add("TENANT_SETTINGS_CLASSES_CONFIG");
            } else {
                 missingComponents.add("OFFERINGS_MISSING");
            }
            isReady = false;
        } else {
            for (com.ims.academic.entity.ImsOfferings offering : offerings) {
                boolean hasAnySubjects = !offeringSubjectsRepo.findByOfferingId(offering.getId()).isEmpty();
                if (!hasAnySubjects) {
                    missingComponents.add("SUBJECT_MAPPING_MISSING_" + offering.getName().replace(" ", "_"));
                    isReady = false;
                }
            }
        }

        return AcademicReadinessDto.builder()
                .isReady(isReady)
                .tenantType(tenantType)
                .missingComponents(missingComponents)
                .build();
    }
}
