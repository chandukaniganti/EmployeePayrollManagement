
package com.payroll.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.payroll.dto.BankAccountRequest;
import com.payroll.dto.BankAccountResponse;
import com.payroll.repository.EmployeeRepository;
import com.payroll.service.BankAccountService;

@RestController
@RequestMapping("/api/bank-accounts")
@CrossOrigin(origins = "http://localhost:5173")
public class BankAccountController {

    private final BankAccountService bankAccountService;
    private final EmployeeRepository employeeRepository;

    public BankAccountController(
            BankAccountService bankAccountService,
            EmployeeRepository employeeRepository) {
        this.bankAccountService = bankAccountService;
        this.employeeRepository = employeeRepository;
    }

    @PostMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<BankAccountResponse> addMyBankAccount(
            Authentication authentication,
            @RequestBody BankAccountRequest request) {

        Long employeeId = employeeRepository
                .findByUserUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Employee profile not found."))
                .getId();

        BankAccountResponse response =
                bankAccountService.addBankAccount(employeeId, request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<BankAccountResponse> getMyBankAccount(
            Authentication authentication) {

        Long employeeId = employeeRepository
                .findByUserUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Employee profile not found."))
                .getId();

        return ResponseEntity.ok(
                bankAccountService.getBankAccount(employeeId));
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<BankAccountResponse> getEmployeeBankAccount(
            @PathVariable Long employeeId) {

        return ResponseEntity.ok(
                bankAccountService.getBankAccount(employeeId));
    }
}
