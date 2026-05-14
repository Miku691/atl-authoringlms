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
import com.ims.finance.client.OfferingServiceClient;
import com.ims.finance.util.ApiResponse;

/**
 * Implementation of FeeStructureService.
 */
@Service
public class FeeStructureServiceImpl implements FeeStructureService {

    private final FeeStructureRepository feeStructureRepository;
    private final FeeHeadRepository feeHeadRepository;
    private final ModelMapper modelMapper;
    private final OfferingServiceClient offeringServiceClient;

    public FeeStructureServiceImpl(FeeStructureRepository feeStructureRepository,
            FeeHeadRepository feeHeadRepository,
            ModelMapper modelMapper,
            OfferingServiceClient offeringServiceClient) {
        this.feeStructureRepository = feeStructureRepository;
        this.feeHeadRepository = feeHeadRepository;
        this.modelMapper = modelMapper;
        this.offeringServiceClient = offeringServiceClient;
    }

    @Override
    public FeeStructureDTO createFeeStructure(FeeStructureDTO feeStructureDTO) {
        if (!feeHeadRepository.existsById(feeStructureDTO.getFeeHeadId())) {
            throw new ResourceNotFoundException("feeHeadId", feeStructureDTO.getFeeHeadId());
        }
        
        FeeStructure feeStructure = modelMapper.map(feeStructureDTO, FeeStructure.class);
        feeStructure.setTenantId(SecurityUtils.getCurrentTenantId());

        if (feeStructureDTO.getOfferingId() != null) {
            ApiResponse<OfferingServiceClient.OfferingResponse> response = 
                offeringServiceClient.getOfferingById(feeStructureDTO.getOfferingId());
            
            if (response != null && "SUCCESS".equals(response.getStatus()) && response.getApiData() != null) {
                String classId = response.getApiData().getClassId();
                String yearId = response.getApiData().getYearId();
                String courseId = response.getApiData().getCourseId();
                
                if (classId != null && !classId.isEmpty()) {
                    feeStructure.setLevelId(classId);
                    feeStructure.setOfferingId(null);
                } else if (yearId != null && !yearId.isEmpty()) {
                    feeStructure.setLevelId(yearId);
                    feeStructure.setOfferingId(null);
                } else if (courseId != null && !courseId.isEmpty()) {
                    feeStructure.setLevelId(courseId);
                    feeStructure.setOfferingId(null);
                } else {
                    feeStructure.setOfferingId(feeStructureDTO.getOfferingId());
                }
            } else {
                feeStructure.setOfferingId(feeStructureDTO.getOfferingId());
            }
        }

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
        
        List<FeeStructure> structures = feeStructureRepository.findAllByOfferingIdAndTenantId(offeringId, tenantId);
        
        ApiResponse<OfferingServiceClient.OfferingResponse> response = 
            offeringServiceClient.getOfferingById(offeringId);
            
        if (response != null && "SUCCESS".equals(response.getStatus()) && response.getApiData() != null) {
            String classId = response.getApiData().getClassId();
            String yearId = response.getApiData().getYearId();
            String courseId = response.getApiData().getCourseId();
            
            String levelId = null;
            if (classId != null && !classId.isEmpty()) {
                levelId = classId;
            } else if (yearId != null && !yearId.isEmpty()) {
                levelId = yearId;
            } else if (courseId != null && !courseId.isEmpty()) {
                levelId = courseId;
            }

            if (levelId != null) {
                List<FeeStructure> levelStructures = feeStructureRepository.findAllByLevelIdAndTenantId(levelId, tenantId);
                // In case the frontend explicitly needs the offeringId returned so it can match the filter
                levelStructures.forEach(ls -> {
                    if (ls.getOfferingId() == null) {
                        ls.setOfferingId(offeringId);
                    }
                });
                structures.addAll(levelStructures);
            }
        }

        return structures.stream()
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
