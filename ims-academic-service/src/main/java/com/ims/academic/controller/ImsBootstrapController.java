package com.ims.academic.controller;

import com.ims.academic.dto.bootstrap.BootstrapReqDto;
import com.ims.academic.service.ImsBootstrapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/bootstrap")
@RequiredArgsConstructor
public class ImsBootstrapController {
    private final ImsBootstrapService bootstrapService;

    @PostMapping
    public ResponseEntity<Boolean> bootstrapTenant(@RequestBody BootstrapReqDto reqDto) {
        boolean success = bootstrapService.bootstrapTenant(reqDto);
        return ResponseEntity.ok(success);
    }

    @GetMapping("/status")
    public ResponseEntity<Boolean> checkSetupStatus(@RequestParam String tenantId) {
        return ResponseEntity.ok(bootstrapService.isSetupComplete(tenantId));
    }
}
