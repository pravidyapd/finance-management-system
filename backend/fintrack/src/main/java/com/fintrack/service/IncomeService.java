
package com.fintrack.service;

import com.fintrack.entity.Income;
import com.fintrack.repository.IncomeRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IncomeService {

    private final IncomeRepository incomeRepository;

    public IncomeService(IncomeRepository incomeRepository) {
        this.incomeRepository = incomeRepository;
    }

    public List<Income> getAllIncomes() {
        return incomeRepository.findAll();
    }

    public Income getIncomeById(Long id) {
        return incomeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Income not found"));
    }

    public Income createIncome(Income income) {
        return incomeRepository.save(income);
    }

    public Income updateIncome(Long id, Income income) {
    Income existing = getIncomeById(id);

    existing.setSource(income.getSource());
    existing.setDescription(income.getDescription());
    existing.setCategory(income.getCategory());
    existing.setAmount(income.getAmount());
    existing.setDate(income.getDate());
    existing.setPaymentMethod(income.getPaymentMethod());
    existing.setStatus(income.getStatus());

    return incomeRepository.save(existing);
}

    public void deleteIncome(Long id) {
        Income existing = getIncomeById(id);
        incomeRepository.delete(existing);
    }
}
