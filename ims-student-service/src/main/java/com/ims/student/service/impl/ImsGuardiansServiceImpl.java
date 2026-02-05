package com.ims.student.service.impl;

import com.ims.student.dto.ImsGuardiansDto;
import com.ims.student.entity.ImsGuardians;
import com.ims.student.exception.ResourceNotFoundException;
import com.ims.student.repo.ImsGuardiansRepo;
import com.ims.student.service.ImsGuardiansService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImsGuardiansServiceImpl implements ImsGuardiansService {

    private final ImsGuardiansRepo repo;
    private final ModelMapper modelMapper;

    @Override
    public ImsGuardiansDto create(ImsGuardiansDto dto) {
        ImsGuardians entity = modelMapper.map(dto, ImsGuardians.class);
        ImsGuardians saved = repo.save(entity);
        return modelMapper.map(saved, ImsGuardiansDto.class);
    }

    @Override
    public ImsGuardiansDto update(String id, ImsGuardiansDto dto) {
        ImsGuardians existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Guardian ID", id));

        existing.setName(dto.getName());
        existing.setPhone(dto.getPhone());
        existing.setEmail(dto.getEmail());
        existing.setOccupation(dto.getOccupation());
        existing.setAddress(dto.getAddress());

        ImsGuardians updated = repo.save(existing);
        return modelMapper.map(updated, ImsGuardiansDto.class);
    }

    @Override
    public ImsGuardiansDto getById(String id) {
        return repo.findById(id)
                .map(entity -> modelMapper.map(entity, ImsGuardiansDto.class))
                .orElseThrow(() -> new ResourceNotFoundException("Guardian ID", id));
    }

    @Override
    public List<ImsGuardiansDto> getByTenant(String tenantId) {
        return repo.findByTenantId(tenantId).stream()
                .map(entity -> modelMapper.map(entity, ImsGuardiansDto.class))
                .collect(Collectors.toList());
    }

    @Override
    public ImsGuardiansDto getByPhoneAndTenant(String phone, String tenantId) {
        return repo.findByPhoneAndTenantId(phone, tenantId)
                .map(entity -> modelMapper.map(entity, ImsGuardiansDto.class))
                .orElseThrow(() -> new ResourceNotFoundException("Guardian Phone", phone));
    }

    @Override
    public void delete(String id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Guardian ID", id);
        }
        repo.deleteById(id);
    }

    // Retaining this for existing admission flows if any, but adding tenant logic
    public ImsGuardians getOrCreate(ImsGuardiansDto dto) {
        Optional<ImsGuardians> existing = repo.findByPhoneAndTenantId(dto.getPhone(), dto.getTenantId());
        if (existing.isPresent()) {
            return existing.get();
        }
        ImsGuardians entity = modelMapper.map(dto, ImsGuardians.class);
        return repo.save(entity);
    }
}
