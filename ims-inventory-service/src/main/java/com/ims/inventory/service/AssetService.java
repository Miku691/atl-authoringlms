package com.ims.inventory.service;

import com.ims.inventory.dto.AssetDTO;
import java.util.List;

public interface AssetService {
    List<AssetDTO> getAllAssets();
    AssetDTO createAsset(AssetDTO dto);
    AssetDTO updateAsset(String id, AssetDTO dto);
    void deleteAsset(String id);
}
