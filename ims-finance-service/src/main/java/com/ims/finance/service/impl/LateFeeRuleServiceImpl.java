package com.ims.finance.service.impl;

import com.ims.finance.dto.LateFeeRuleDTO;
import com.ims.finance.entity.LateFeeRule;
import com.ims.finance.exception.ResourceNotFoundException;
import com.ims.finance.repository.LateFeeRuleRepository;
import com.ims.finance.service.LateFeeRuleService;
import com.ims.finance.util.SecurityUtils;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LateFeeRuleServiceImpl implements LateFeeRuleService {

    private final LateFeeRuleRepository lateFeeRuleRepository;
    private final ModelMapper modelMapper;

    public LateFeeRuleServiceImpl(LateFeeRuleRepository lateFeeRuleRepository, ModelMapper modelMapper) {
        this.lateFeeRuleRepository = lateFeeRuleRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public LateFeeRuleDTO createLateFeeRule(LateFeeRuleDTO lateFeeRuleDTO) {
        LateFeeRule lateFeeRule = modelMapper.map(lateFeeRuleDTO, LateFeeRule.class);
        lateFeeRule.setTenantId(SecurityUtils.getCurrentTenantId());
        LateFeeRule saved = lateFeeRuleRepository.save(lateFeeRule);
        return modelMapper.map(saved, LateFeeRuleDTO.class);
    }

    @Override
    public List<LateFeeRuleDTO> getAllLateFeeRules() {
        String tenantId = SecurityUtils.getCurrentTenantId();
        return lateFeeRuleRepository.findAllByTenantId(tenantId).stream()
                .map(rule -> modelMapper.map(rule, LateFeeRuleDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public LateFeeRuleDTO updateLateFeeRule(String id, LateFeeRuleDTO lateFeeRuleDTO) {
        LateFeeRule rule = lateFeeRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LateFeeRule", id));

        rule.setName(lateFeeRuleDTO.getName());
        rule.setType(lateFeeRuleDTO.getType());
        rule.setValue(lateFeeRuleDTO.getValue());
        rule.setGracePeriodDays(lateFeeRuleDTO.getGracePeriodDays());

        LateFeeRule updated = lateFeeRuleRepository.save(rule);
        return modelMapper.map(updated, LateFeeRuleDTO.class);
    }

    @Override
    public LateFeeRuleDTO getLateFeeRuleById(String id) {
        LateFeeRule rule = lateFeeRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LateFeeRule", id));
        return modelMapper.map(rule, LateFeeRuleDTO.class);
    }

    @Override
    public void deleteLateFeeRule(String id) {
        LateFeeRule rule = lateFeeRuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LateFeeRule", id));
        lateFeeRuleRepository.delete(rule);
    }
}
