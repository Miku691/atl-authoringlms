package com.ims.student.controller;

import com.ims.student.util.ApiResponse;
import com.ims.student.entity.ImsMasterDocumentType;
import com.ims.student.repo.ImsMasterDocumentTypeRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for managing Master Document Types.
 * Exposes endpoints for the frontend to fetch dynamic document categories.
 */
@RestController
@RequestMapping("/master-document-types")
@RequiredArgsConstructor
public class ImsMasterDocumentTypeController {

    private final ImsMasterDocumentTypeRepo repo;

    /**
     * Fetches all master document types for a specific tenant.
     * If no types exist for the tenant, it seeds initial default types.
     *
     * @param tenantId current tenant ID from headers
     * @return response containing list of document types
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ImsMasterDocumentType>>> getAll(@RequestHeader("X-Tenant-Id") String tenantId) {
        List<ImsMasterDocumentType> types = repo.findByTenantId(tenantId);

        if (types.isEmpty()) {
            // Seeding default types if none exist for this tenant
            types = List.of(
                ImsMasterDocumentType.builder().id(UUID.randomUUID().toString()).code("AADHAR").label("Government ID (Aadhar/PAN)").tenantId(tenantId).build(),
                ImsMasterDocumentType.builder().id(UUID.randomUUID().toString()).code("BIRTH_CERT").label("Birth Certificate").tenantId(tenantId).build(),
                ImsMasterDocumentType.builder().id(UUID.randomUUID().toString()).code("MARK_SHEET").label("Previous Mark Sheet").tenantId(tenantId).build(),
                ImsMasterDocumentType.builder().id(UUID.randomUUID().toString()).code("TRANSFER_CERT").label("Transfer Certificate (TC)").tenantId(tenantId).build(),
                ImsMasterDocumentType.builder().id(UUID.randomUUID().toString()).code("PASSPORT_PHOTO").label("Passport Photo").tenantId(tenantId).build(),
                ImsMasterDocumentType.builder().id(UUID.randomUUID().toString()).code("OTHER").label("Other Document").tenantId(tenantId).build()
            );
            repo.saveAll(types);
        }

        return ResponseEntity.ok(ApiResponse.success(200, "Document types fetched successfully", types));
    }
}
