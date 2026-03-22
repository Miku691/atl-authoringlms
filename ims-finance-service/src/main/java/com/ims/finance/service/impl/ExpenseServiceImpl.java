package com.ims.finance.service.impl;

import com.ims.finance.dto.ExpenseCategoryDTO;
import com.ims.finance.dto.ExpenseDTO;
import com.ims.finance.entity.Expense;
import com.ims.finance.entity.ExpenseCategory;
import com.ims.finance.repository.ExpenseCategoryRepository;
import com.ims.finance.repository.ExpenseRepository;
import com.ims.finance.service.ExpenseService;
import com.ims.finance.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseCategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final ModelMapper modelMapper;

    @Override
    @Transactional
    public ExpenseCategoryDTO createCategory(ExpenseCategoryDTO dto) {
        ExpenseCategory category = modelMapper.map(dto, ExpenseCategory.class);
        category.setTenantId(SecurityUtils.getCurrentTenantId());
        category = categoryRepository.save(category);
        return modelMapper.map(category, ExpenseCategoryDTO.class);
    }

    @Override
    public List<ExpenseCategoryDTO> getCategoriesByTenant() {
        return categoryRepository.findByTenantId(SecurityUtils.getCurrentTenantId()).stream()
                .map(cat -> modelMapper.map(cat, ExpenseCategoryDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteCategory(String id) {
        categoryRepository.deleteById(id);
    }

    @Override
    @Transactional
    public ExpenseDTO recordExpense(ExpenseDTO dto) {
        ExpenseCategory category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Expense category not found"));

        Expense expense = modelMapper.map(dto, Expense.class);
        expense.setCategory(category);
        expense.setTenantId(SecurityUtils.getCurrentTenantId());
        
        expense = expenseRepository.save(expense);
        
        ExpenseDTO result = modelMapper.map(expense, ExpenseDTO.class);
        result.setCategoryId(category.getId());
        result.setCategoryName(category.getName());
        return result;
    }

    @Override
    public List<ExpenseDTO> getExpensesByTenant() {
        return expenseRepository.findByTenantId(SecurityUtils.getCurrentTenantId()).stream()
                .map(exp -> {
                    ExpenseDTO dto = modelMapper.map(exp, ExpenseDTO.class);
                    dto.setCategoryId(exp.getCategory().getId());
                    dto.setCategoryName(exp.getCategory().getName());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteExpense(String id) {
        expenseRepository.deleteById(id);
    }
}
