package com.ims.inventory.controller;

import com.ims.inventory.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for one-click bulk setup of inventory data.
 */
@RestController
@RequestMapping("/api/v1/inventory/bulk-setup")
@RequiredArgsConstructor
public class InventoryBulkSetupController {

    private final InventoryService inventoryService;

    @PostMapping("/categories")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<Void> setupCategories() {
        inventoryService.bootstrapCategories();
        return ResponseEntity.ok().build();
    }

    @GetMapping("/status")
    @PreAuthorize("hasRole('TENANT_ADMIN')")
    public ResponseEntity<Map<String, Boolean>> getStatus() {
        return ResponseEntity.ok(inventoryService.getBulkSetupStatus());
    }
}
