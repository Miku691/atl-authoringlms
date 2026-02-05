package com.ims.finance.service.impl;

import com.ims.finance.dto.FeeStructureDTO;
import com.ims.finance.entity.FeeStructure;
import com.ims.finance.exception.ResourceNotFoundException;
import com.ims.finance.repository.FeeStructureRepository;
import com.ims.finance.repository.FeeHeadRepository;
import com.ims.finance.service.FeeStructureService;
import com.ims.finance.util.SecurityUtils;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of FeeStructureService.
 */
@Service
public class FeeStructureServiceImpl implements FeeStructureService {

    private final FeeStructureRepository feeStructureRepository;
    private final FeeHeadRepository feeHeadRepository;
    private final ModelMapper modelMapper;

    public FeeStructureServiceImpl(FeeStructureRepository feeStructureRepository,
            FeeHeadRepository feeHeadRepository,
            ModelMapper modelMapper) {
        this.feeStructureRepository = feeStructureRepository;
        this.feeHeadRepository = feeHeadRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public FeeStructureDTO createFeeStructure(FeeStructureDTO feeStructureDTO) {
        // Validate Fee Head exists
        if (!feeHeadRepository.existsById(feeStructureDTO.getFeeHeadId())) {
            throw new ResourceNotFoundException("feeHeadId", feeStructureDTO.getFeeHeadId());
        }
        FeeStructure feeStructure = modelMapper.map(feeStructureDTO, FeeStructure.class);
        feeStructure.setTenantId(SecurityUtils.getCurrentTenantId());
        FeeStructure saved = feeStructureRepository.save(feeStructure);
        return modelMapper.map(saved, FeeStructureDTO.class);
    }

    @Override
    public List<FeeStructureDTO> getAllFeeStructures() {
        String tenantId = SecurityUtils.getCurrentTenantId();
        return feeStructureRepository.findAllByTenantId(tenantId).stream()
                .map(fs -> modelMapper.map(fs, FeeStructureDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<FeeStructureDTO> getFeeStructuresByOffering(String offeringId) {
        String tenantId = SecurityUtils.getCurrentTenantId();
        return feeStructureRepository.findAllByOfferingIdAndTenantId(offeringId, tenantId).stream()
                .map(fs -> modelMapper.map(fs, FeeStructureDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public FeeStructureDTO getFeeStructureById(String id) {
        FeeStructure feeStructure = feeStructureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("id", id));
        return modelMapper.map(feeStructure, FeeStructureDTO.class);
    }

    @Override
    public FeeStructureDTO updateFeeStructure(String id, FeeStructureDTO feeStructureDTO) {
        FeeStructure feeStructure = feeStructureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("id", id));

        // Validate Fee Head exists if changed
        if (!feeStructure.getFeeHeadId().equals(feeStructureDTO.getFeeHeadId())) {
            if (!feeHeadRepository.existsById(feeStructureDTO.getFeeHeadId())) {
                throw new ResourceNotFoundException("feeHeadId", feeStructureDTO.getFeeHeadId());
            }
            feeStructure.setFeeHeadId(feeStructureDTO.getFeeHeadId());
        }

        feeStructure.setOfferingId(feeStructureDTO.getOfferingId());
        feeStructure.setAmount(feeStructureDTO.getAmount());
        feeStructure.setAcademicYear(feeStructureDTO.getAcademicYear());

        FeeStructure updatedFeeStructure = feeStructureRepository.save(feeStructure);
        return modelMapper.map(updatedFeeStructure, FeeStructureDTO.class);
    }

    @Override
    public void deleteFeeStructure(String id) {
        FeeStructure feeStructure = feeStructureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("id", id));
        feeStructureRepository.delete(feeStructure);
    }
}
