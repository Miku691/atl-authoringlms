package com.ims.inventory.service.impl;

import com.ims.inventory.dto.AssetDTO;
import com.ims.inventory.entity.Asset;
import com.ims.inventory.repository.AssetRepository;
import com.ims.inventory.repository.InventoryCategoryRepository;
import com.ims.inventory.service.AssetService;
import com.ims.inventory.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AssetServiceImpl implements AssetService {

    private final AssetRepository assetRepository;
    private final InventoryCategoryRepository categoryRepository;
    private final ModelMapper modelMapper;

    @Override
    public List<AssetDTO> getAllAssets() {
        String tenantId = SecurityUtils.getCurrentTenantId();
        return assetRepository.findByTenantId(tenantId).stream()
                .map(asset -> {
                    AssetDTO dto = modelMapper.map(asset, AssetDTO.class);
                    categoryRepository.findById(asset.getCategoryId())
                            .ifPresent(cat -> dto.setCategoryName(cat.getName()));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public AssetDTO createAsset(AssetDTO dto) {
        Asset asset = modelMapper.map(dto, Asset.class);
        asset.setTenantId(SecurityUtils.getCurrentTenantId());
        return modelMapper.map(assetRepository.save(asset), AssetDTO.class);
    }

    @Override
    public AssetDTO updateAsset(String id, AssetDTO dto) {
        Asset existing = assetRepository.findById(id).orElseThrow();
        existing.setName(dto.getName());
        existing.setCategoryId(dto.getCategoryId());
        existing.setItemId(dto.getItemId());
        existing.setSerialNumber(dto.getSerialNumber());
        existing.setPurchaseDate(dto.getPurchaseDate());
        existing.setPurchaseValue(dto.getPurchaseValue());
        existing.setLocation(dto.getLocation());
        existing.setStatus(dto.getStatus());
        return modelMapper.map(assetRepository.save(existing), AssetDTO.class);
    }

    @Override
    public void deleteAsset(String id) {
        assetRepository.deleteById(id);
    }
}
