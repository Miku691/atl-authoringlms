package com.ims.finance.service;

import com.ims.finance.dto.BudgetDTO;
import java.util.List;

public interface BudgetService {
    BudgetDTO saveBudget(BudgetDTO dto);
    List<BudgetDTO> getBudgets(String academicYear);
    List<BudgetDTO> getBudgetVsActual(String academicYear);
    void deleteBudget(String id);
}
