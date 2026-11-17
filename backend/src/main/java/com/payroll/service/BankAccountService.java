
package com.payroll.service;

import java.time.LocalDateTime;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.payroll.dto.BankAccountRequest;
import com.payroll.dto.BankAccountResponse;
import com.payroll.entity.BankAccount;
import com.payroll.entity.Employee;
import com.payroll.exception.ResourceNotFoundException;
import com.payroll.repository.BankAccountRepository;
import com.payroll.repository.EmployeeRepository;

@Service
public class BankAccountService {

    private final BankAccountRepository bankAccountRepository;
    private final EmployeeRepository employeeRepository;
    private final BankAccountMapper bankAccountMapper;

    public BankAccountService(
            BankAccountRepository bankAccountRepository,
            EmployeeRepository employeeRepository,
            BankAccountMapper bankAccountMapper) {
        this.bankAccountRepository = bankAccountRepository;
        this.employeeRepository = employeeRepository;
        this.bankAccountMapper = bankAccountMapper;
    }

    @Transactional
    public BankAccountResponse addBankAccount(Long employeeId, BankAccountRequest request) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee not found with ID: " + employeeId));

        if (bankAccountRepository.existsByEmployeeId(employeeId)) {
            throw new IllegalArgumentException(
                    "Bank account is already registered for this employee.");
        }

        validateRequest(request);

        BankAccount bankAccount = new BankAccount();
        bankAccount.setEmployee(employee);
        bankAccount.setAccountHolderName(request.getAccountHolderName().trim());
        bankAccount.setAccountNumber(request.getAccountNumber().trim());
        bankAccount.setIfscCode(request.getIfscCode().trim().toUpperCase(Locale.ROOT));
        bankAccount.setBankName(request.getBankName());
        bankAccount.setBranchName(request.getBranchName());
        bankAccount.setAccountType(request.getAccountType().trim().toUpperCase(Locale.ROOT));
        bankAccount.setCreatedAt(LocalDateTime.now());

        BankAccount savedAccount = bankAccountRepository.save(bankAccount);

        return bankAccountMapper.toResponse(savedAccount);
    }

    @Transactional(readOnly = true)
    public BankAccountResponse getBankAccount(Long employeeId) {

        BankAccount bankAccount = bankAccountRepository.findByEmployeeId(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Bank account not found for employee ID: " + employeeId));

        return bankAccountMapper.toResponse(bankAccount);
    }

    private void validateRequest(BankAccountRequest request) {

        if (request == null) {
            throw new IllegalArgumentException("Bank account details are required.");
        }

        if (request.getAccountHolderName() == null
                || request.getAccountHolderName().isBlank()) {
            throw new IllegalArgumentException("Account holder name is required.");
        }

        String accountNumber = request.getAccountNumber();

        if (accountNumber == null
                || !accountNumber.trim().matches("\\d{9,18}")) {
            throw new IllegalArgumentException(
                    "Account number must contain 9 to 18 digits.");
        }

        String ifscCode = request.getIfscCode();

        if (ifscCode == null
                || !ifscCode.trim().toUpperCase(Locale.ROOT)
                        .matches("^[A-Z]{4}0[A-Z0-9]{6}$")) {
            throw new IllegalArgumentException("Please enter a valid IFSC code.");
        }

        String accountType = request.getAccountType();

        if (accountType == null
                || !accountType.trim().toUpperCase(Locale.ROOT)
                        .matches("SAVINGS|CURRENT|SALARY")) {
            throw new IllegalArgumentException(
                    "Account type must be SAVINGS, CURRENT, or SALARY.");
        }
    }
}
