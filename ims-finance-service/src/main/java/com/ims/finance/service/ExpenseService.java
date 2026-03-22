package com.ims.finance.service;

import com.ims.finance.dto.ExpenseCategoryDTO;
import com.ims.finance.dto.ExpenseDTO;
import java.util.List;

public interface ExpenseService {
    // Categories
    ExpenseCategoryDTO createCategory(ExpenseCategoryDTO dto);
    List<ExpenseCategoryDTO> getCategoriesByTenant();
    void deleteCategory(String id);

    // Expenses
    ExpenseDTO recordExpense(ExpenseDTO dto);
    List<ExpenseDTO> getExpensesByTenant();
    void deleteExpense(String id);
}
