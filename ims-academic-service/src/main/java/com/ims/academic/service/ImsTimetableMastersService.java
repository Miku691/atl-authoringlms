package com.ims.academic.service;

import com.ims.academic.dto.ImsTimetableMastersDto;
import java.util.List;

public interface ImsTimetableMastersService {

    ImsTimetableMastersDto create(ImsTimetableMastersDto dto);

    ImsTimetableMastersDto update(String id, ImsTimetableMastersDto dto);

    ImsTimetableMastersDto getById(String id);

    List<ImsTimetableMastersDto> getByOfferingId(String offeringId);

    List<ImsTimetableMastersDto> getByOfferingIdAndTenantId(String offeringId, String tenantId);

    void delete(String id);
}
