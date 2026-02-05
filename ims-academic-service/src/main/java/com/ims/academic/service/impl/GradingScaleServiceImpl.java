package com.ims.academic.service.impl;

import com.ims.academic.dto.GradingScaleDto;
import com.ims.academic.dto.MessageDto;
import com.ims.academic.entity.GradingScale;
import com.ims.academic.exception.ResourceNotFoundException;
import com.ims.academic.repo.GradingScaleRepo;
import com.ims.academic.service.GradingScaleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GradingScaleServiceImpl implements GradingScaleService {

    private final GradingScaleRepo gradingScaleRepo;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public MessageDto createGradingScale(String tenantId, GradingScaleDto dto) {
        if (gradingScaleRepo.existsByTenantIdAndGradeLabel(tenantId, dto.getGradeLabel())) {
            throw new RuntimeException("Grading scale with label " + dto.getGradeLabel() + " already exists.");
        }

        GradingScale gradingScale = modelMapper.map(dto, GradingScale.class);
        gradingScale.setTenantId(tenantId);
        gradingScaleRepo.save(gradingScale);

        return new MessageDto("Grading scale created successfully", "SUCCESS");
    }

    @Override
    public List<GradingScaleDto> getGradingScales(String tenantId) {
        return gradingScaleRepo.findByTenantId(tenantId).stream()
                .map(gs -> modelMapper.map(gs, GradingScaleDto.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MessageDto updateGradingScale(String tenantId, String id, GradingScaleDto dto) {
        GradingScale gradingScale = gradingScaleRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GradingScale", id));

        if (!gradingScale.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access Denied: Record does not belong to your institute.");
        }

        gradingScale.setGradeLabel(dto.getGradeLabel());
        gradingScale.setMinPercentage(dto.getMinPercentage());
        gradingScale.setMaxPercentage(dto.getMaxPercentage());
        gradingScale.setGradePoint(dto.getGradePoint());
        gradingScale.setDescription(dto.getDescription());

        gradingScaleRepo.save(gradingScale);
        return new MessageDto("Grading scale updated successfully", "SUCCESS");
    }

    @Override
    @Transactional
    public MessageDto deleteGradingScale(String tenantId, String id) {
        GradingScale gradingScale = gradingScaleRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("GradingScale", id));

        if (!gradingScale.getTenantId().equals(tenantId)) {
            throw new RuntimeException("Access Denied: Record does not belong to your institute.");
        }

        gradingScaleRepo.delete(gradingScale);
        return new MessageDto("Grading scale deleted successfully", "SUCCESS");
    }
}
