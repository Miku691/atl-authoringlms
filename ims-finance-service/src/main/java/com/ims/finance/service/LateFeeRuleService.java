package com.ims.finance.service;

import com.ims.finance.dto.LateFeeRuleDTO;
import java.util.List;

public interface LateFeeRuleService {
    LateFeeRuleDTO createLateFeeRule(LateFeeRuleDTO lateFeeRuleDTO);

    LateFeeRuleDTO updateLateFeeRule(String id, LateFeeRuleDTO lateFeeRuleDTO);

    LateFeeRuleDTO getLateFeeRuleById(String id);

    List<LateFeeRuleDTO> getAllLateFeeRules();

    void deleteLateFeeRule(String id);
}
