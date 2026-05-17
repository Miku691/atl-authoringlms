package com.ims.inventory.controller;

import com.ims.inventory.dto.AssetDTO;
import com.ims.inventory.service.AssetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/inventory/assets")
@RequiredArgsConstructor
public class AssetController {

    private final AssetService assetService;

    /**
     * Retrieves all registered assets for the current tenant.
     *
     * @return list of assets wrapped in response map
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Map<String, Object>> getAssets() {
        return ResponseEntity.ok(Map.of("apiData", assetService.getAllAssets()));
    }

    /**
     * Creates a new asset record in the asset register.
     *
     * @param dto asset details including optional master itemId
     * @return created asset data wrapped in response map
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Map<String, Object>> createAsset(@RequestBody AssetDTO dto) {
        return ResponseEntity.ok(Map.of("apiData", assetService.createAsset(dto)));
    }

    /**
     * Updates an existing asset record.
     *
     * @param id asset unique identifier
     * @param dto updated asset details
     * @return updated asset data wrapped in response map
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Map<String, Object>> updateAsset(@PathVariable String id, @RequestBody AssetDTO dto) {
        return ResponseEntity.ok(Map.of("apiData", assetService.updateAsset(id, dto)));
    }

    /**
     * Deletes an asset record from the asset register.
     *
     * @param id asset unique identifier
     * @return no content response
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Void> deleteAsset(@PathVariable String id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }
}
