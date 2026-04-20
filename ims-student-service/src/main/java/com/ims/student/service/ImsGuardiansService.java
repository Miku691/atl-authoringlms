package com.ims.student.service;

import com.ims.student.dto.ImsGuardiansDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

/**
 * Service interface for managing master guardian records.
 */
public interface ImsGuardiansService {
    ImsGuardiansDto create(ImsGuardiansDto dto);

    ImsGuardiansDto update(String id, ImsGuardiansDto dto);

    ImsGuardiansDto getById(String id);

    Page<ImsGuardiansDto> getByTenant(String tenantId, Pageable pageable);

    ImsGuardiansDto getByPhoneAndTenant(String phone, String tenantId);

    void delete(String id);

    void grantAccess(String id);
}
