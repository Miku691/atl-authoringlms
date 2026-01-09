package com.ims.academic.service;

import com.ims.academic.dto.ImsOfferingClassMappingsDto;
import java.util.List;

public interface ImsOfferingClassMappingsService {

    ImsOfferingClassMappingsDto create(ImsOfferingClassMappingsDto dto);

    ImsOfferingClassMappingsDto update(String id, ImsOfferingClassMappingsDto dto);

    ImsOfferingClassMappingsDto getById(String id);

    List<ImsOfferingClassMappingsDto> getByOfferingId(String offeringId);

    List<ImsOfferingClassMappingsDto> getByClassId(String classId);

    void delete(String id);
}
