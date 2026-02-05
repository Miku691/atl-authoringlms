package com.ims.student.service;

import com.ims.student.dto.ImsGuardiansDto;
import java.util.List;

/**
 * Service interface for managing master guardian records.
 */
public interface ImsGuardiansService {
    ImsGuardiansDto create(ImsGuardiansDto dto);

    ImsGuardiansDto update(String id, ImsGuardiansDto dto);

    ImsGuardiansDto getById(String id);

    List<ImsGuardiansDto> getByTenant(String tenantId);

    ImsGuardiansDto getByPhoneAndTenant(String phone, String tenantId);

    void delete(String id);
}
