
package com.payroll.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.payroll.dto.PayrollRequest;
import com.payroll.dto.PayrollResponse;
import com.payroll.entity.Employee;
import com.payroll.entity.Payroll;
import com.payroll.exception.ResourceNotFoundException;
import com.payroll.repository.EmployeeRepository;
import com.payroll.repository.PayrollRepository;

@Service
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final PayrollMapper payrollMapper;

    public PayrollService(
            PayrollRepository payrollRepository,
            EmployeeRepository employeeRepository,
            PayrollMapper payrollMapper) {

        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
        this.payrollMapper = payrollMapper;
    }

    @Transactional
    public PayrollResponse generatePayroll(PayrollRequest request) {

        if (request.getEmployeeId() == null) {
            throw new IllegalArgumentException("Employee ID is required.");
        }

        if (request.getPayrollMonth() == null ||
                request.getPayrollMonth() < 1 ||
                request.getPayrollMonth() > 12) {
            throw new IllegalArgumentException("Payroll month must be between 1 and 12.");
        }

        if (request.getPayrollYear() == null ||
                request.getPayrollYear() < 2000 ||
                request.getPayrollYear() > 2100) {
            throw new IllegalArgumentException("Enter a valid payroll year.");
        }

        validateAmounts(request);

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee not found with ID: " + request.getEmployeeId()));

        if (payrollRepository.findByEmployeeIdAndPayrollMonthAndPayrollYear(
                request.getEmployeeId(),
                request.getPayrollMonth(),
                request.getPayrollYear()).isPresent()) {
            throw new IllegalStateException(
                    "Payroll already exists for this employee and month.");
        }

        double basicSalary = employee.getBasicSalary();

        double grossSalary = basicSalary
                + request.getHra()
                + request.getDa()
                + request.getOtherAllowances();

        double totalDeductions = request.getPf()
                + request.getEsi()
                + request.getOtherDeductions();

        double netSalary = grossSalary - totalDeductions;

        if (netSalary < 0) {
            throw new IllegalArgumentException(
                    "Total deductions cannot exceed gross salary.");
        }

        Payroll payroll = new Payroll();

        payroll.setEmployee(employee);
        payroll.setPayrollMonth(request.getPayrollMonth());
        payroll.setPayrollYear(request.getPayrollYear());

        payroll.setBasicSalary(basicSalary);
        payroll.setHra(request.getHra());
        payroll.setDa(request.getDa());
        payroll.setOtherAllowances(request.getOtherAllowances());
        payroll.setGrossSalary(round(grossSalary));

        payroll.setPf(request.getPf());
        payroll.setEsi(request.getEsi());
        payroll.setOtherDeductions(request.getOtherDeductions());
        payroll.setTotalDeductions(round(totalDeductions));

        payroll.setNetSalary(round(netSalary));
        payroll.setStatus("GENERATED");

        Payroll savedPayroll = payrollRepository.save(payroll);

        return payrollMapper.toResponse(savedPayroll);
    }
    public List<PayrollResponse> getMyPayrolls(String username) {

    Employee employee = employeeRepository.findByUserUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException(
                    "No employee profile found for username: " + username));

    return payrollRepository.findByEmployeeId(employee.getId())
            .stream()
            .map(payrollMapper::toResponse)
            .toList();
}

    public List<PayrollResponse> getAllPayrolls() {

        return payrollRepository.findAll()
                .stream()
                .map(payrollMapper::toResponse)
                .toList();
    }

    public List<PayrollResponse> getPayrollsByEmployee(Long employeeId) {

        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException(
                    "Employee not found with ID: " + employeeId);
        }

        return payrollRepository.findByEmployeeId(employeeId)
                .stream()
                .map(payrollMapper::toResponse)
                .toList();
    }

    public List<PayrollResponse> getPayrollsByMonthAndYear(
            Integer month, Integer year) {

        if (month == null || month < 1 || month > 12) {
            throw new IllegalArgumentException("Payroll month must be between 1 and 12.");
        }

        if (year == null || year < 2000 || year > 2100) {
            throw new IllegalArgumentException("Enter a valid payroll year.");
        }

        return payrollRepository.findByPayrollMonthAndPayrollYear(month, year)
                .stream()
                .map(payrollMapper::toResponse)
                .toList();
    }

    private void validateAmounts(PayrollRequest request) {

        if (request.getHra() == null ||
                request.getDa() == null ||
                request.getOtherAllowances() == null ||
                request.getPf() == null ||
                request.getEsi() == null ||
                request.getOtherDeductions() == null) {

            throw new IllegalArgumentException(
                    "All salary components must have a value.");
        }

        if (!isValidAmount(request.getHra()) ||
                !isValidAmount(request.getDa()) ||
                !isValidAmount(request.getOtherAllowances()) ||
                !isValidAmount(request.getPf()) ||
                !isValidAmount(request.getEsi()) ||
                !isValidAmount(request.getOtherDeductions())) {

            throw new IllegalArgumentException(
                    "Salary components must be finite and non-negative.");
        }
    }

    private boolean isValidAmount(Double amount) {
        return Double.isFinite(amount) && amount >= 0;
    }

    private double round(double amount) {
        return Math.round(amount * 100.0) / 100.0;
    }
}
