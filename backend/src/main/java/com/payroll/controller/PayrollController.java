
package com.payroll.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.payroll.dto.PayrollRequest;
import com.payroll.dto.PayrollResponse;
import com.payroll.service.PayrollService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "http://localhost:5173")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    // ADMIN and HR: Generate monthly payroll
    @PostMapping("/generate")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public PayrollResponse generatePayroll(
            @Valid @RequestBody PayrollRequest request) {

        return payrollService.generatePayroll(request);
    }

    // ADMIN and HR: View all payroll records
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public List<PayrollResponse> getAllPayrolls() {

        return payrollService.getAllPayrolls();
    }


    // EMPLOYEE: View only their own payroll history
    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<PayrollResponse> getMyPayrolls(
            org.springframework.security.core.Authentication authentication) {

        return payrollService.getMyPayrolls(authentication.getName());
    }


    // ADMIN and HR: View payroll by employee
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public List<PayrollResponse> getPayrollsByEmployee(
            @PathVariable Long employeeId) {

        return payrollService.getPayrollsByEmployee(employeeId);
    }

    // ADMIN and HR: View payroll by month and year
    @GetMapping("/month")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public List<PayrollResponse> getPayrollsByMonth(
            @RequestParam Integer month,
            @RequestParam Integer year) {

        return payrollService.getPayrollsByMonthAndYear(month, year);
    }
}
