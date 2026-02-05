package com.ims.finance.service.impl;

import com.ims.finance.dto.FeeHeadDTO;
import com.ims.finance.entity.FeeHead;
import com.ims.finance.exception.ResourceNotFoundException;
import com.ims.finance.repository.FeeHeadRepository;
import com.ims.finance.service.FeeHeadService;
import com.ims.finance.util.SecurityUtils;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of FeeHeadService.
 */
@Service
public class FeeHeadServiceImpl implements FeeHeadService {

    private final FeeHeadRepository feeHeadRepository;
    private final ModelMapper modelMapper;

    public FeeHeadServiceImpl(FeeHeadRepository feeHeadRepository, ModelMapper modelMapper) {
        this.feeHeadRepository = feeHeadRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public FeeHeadDTO createFeeHead(FeeHeadDTO feeHeadDTO) {
        FeeHead feeHead = modelMapper.map(feeHeadDTO, FeeHead.class);
        feeHead.setTenantId(SecurityUtils.getCurrentTenantId());
        FeeHead savedFeeHead = feeHeadRepository.save(feeHead);
        return modelMapper.map(savedFeeHead, FeeHeadDTO.class);
    }

    @Override
    public List<FeeHeadDTO> getAllFeeHeads() {
        String tenantId = SecurityUtils.getCurrentTenantId();
        return feeHeadRepository.findAllByTenantId(tenantId).stream()
                .map(feeHead -> modelMapper.map(feeHead, FeeHeadDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public FeeHeadDTO getFeeHeadById(String id) {
        FeeHead feeHead = feeHeadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("id", id));
        return modelMapper.map(feeHead, FeeHeadDTO.class);
    }

    @Override
    public FeeHeadDTO updateFeeHead(String id, FeeHeadDTO feeHeadDTO) {
        FeeHead feeHead = feeHeadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("id", id));

        feeHead.setName(feeHeadDTO.getName());
        feeHead.setDescription(feeHeadDTO.getDescription());

        FeeHead updatedFeeHead = feeHeadRepository.save(feeHead);
        return modelMapper.map(updatedFeeHead, FeeHeadDTO.class);
    }

    @Override
    public void deleteFeeHead(String id) {
        FeeHead feeHead = feeHeadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("id", id));
        feeHeadRepository.delete(feeHead);
    }
}
