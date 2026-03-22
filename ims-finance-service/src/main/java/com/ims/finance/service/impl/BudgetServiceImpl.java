package com.ims.finance.service.impl;

import com.ims.finance.dto.BudgetDTO;
import com.ims.finance.entity.Budget;
import com.ims.finance.entity.Expense;
import com.ims.finance.entity.ExpenseCategory;
import com.ims.finance.repository.BudgetRepository;
import com.ims.finance.repository.ExpenseCategoryRepository;
import com.ims.finance.repository.ExpenseRepository;
import com.ims.finance.service.BudgetService;
import com.ims.finance.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetServiceImpl implements BudgetService {

    private final BudgetRepository budgetRepository;
    private final ExpenseCategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public BudgetDTO saveBudget(BudgetDTO dto) {
        String tenantId = SecurityUtils.getCurrentTenantId();
        
        // Find existing budget for this category and year to update, or create new
        Budget budget = budgetRepository.findByCategoryIdAndAcademicYearAndTenantId(
                dto.getCategoryId(), dto.getAcademicYear(), tenantId)
                .orElse(new Budget());

        if (budget.getId() == null) {
            ExpenseCategory category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Expense category not found"));
            budget.setCategory(category);
            budget.setAcademicYear(dto.getAcademicYear());
            budget.setTenantId(tenantId);
        }

        budget.setAllocatedAmount(dto.getAllocatedAmount());
        budget = budgetRepository.save(budget);
        
        return mapToDTO(budget);
    }

    @Override
    public List<BudgetDTO> getBudgets(String academicYear) {
        return budgetRepository.findByTenantIdAndAcademicYear(SecurityUtils.getCurrentTenantId(), academicYear).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BudgetDTO> getBudgetVsActual(String academicYear) {
        String tenantId = SecurityUtils.getCurrentTenantId();
        
        // Get all budgets for the year
        List<Budget> budgets = budgetRepository.findByTenantIdAndAcademicYear(tenantId, academicYear);
        
        // Get all expenses for the tenant (ideally filtered by academic year, but Expense doesn't have academicYear property yet, so we use date ranges in real apps)
        // For simplicity, we filter expenses by tenant.
        List<Expense> expenses = expenseRepository.findByTenantId(tenantId);
        
        // Group expenses by category
        Map<String, BigDecimal> spendByCategory = expenses.stream()
                .collect(Collectors.groupingBy(
                        exp -> exp.getCategory().getId(),
                        Collectors.reducing(BigDecimal.ZERO, Expense::getAmount, BigDecimal::add)
                ));

        return budgets.stream()
                .map(b -> {
                    BudgetDTO dto = mapToDTO(b);
                    dto.setActualSpend(spendByCategory.getOrDefault(b.getCategory().getId(), BigDecimal.ZERO));
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteBudget(String id) {
        budgetRepository.deleteById(id);
    }

    private BudgetDTO mapToDTO(Budget budget) {
        BudgetDTO dto = modelMapper.map(budget, BudgetDTO.class);
        dto.setCategoryId(budget.getCategory().getId());
        dto.setCategoryName(budget.getCategory().getName());
        return dto;
    }
}
