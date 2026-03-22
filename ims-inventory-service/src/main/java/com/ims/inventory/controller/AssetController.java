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

    @GetMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Map<String, Object>> getAssets() {
        return ResponseEntity.ok(Map.of("apiData", assetService.getAllAssets()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Map<String, Object>> createAsset(@RequestBody AssetDTO dto) {
        return ResponseEntity.ok(Map.of("apiData", assetService.createAsset(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Map<String, Object>> updateAsset(@PathVariable String id, @RequestBody AssetDTO dto) {
        return ResponseEntity.ok(Map.of("apiData", assetService.updateAsset(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('TENANT_ADMIN', 'INVENTORY_MANAGER')")
    public ResponseEntity<Void> deleteAsset(@PathVariable String id) {
        assetService.deleteAsset(id);
        return ResponseEntity.noContent().build();
    }
}
