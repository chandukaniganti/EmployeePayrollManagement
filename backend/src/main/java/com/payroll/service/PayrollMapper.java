
package com.payroll.service;

import org.springframework.stereotype.Component;

import com.payroll.dto.PayrollResponse;
import com.payroll.entity.Payroll;

@Component
public class PayrollMapper {

    public PayrollResponse toResponse(Payroll payroll) {

        PayrollResponse response = new PayrollResponse();

        response.setId(payroll.getId());
        response.setEmployeeId(payroll.getEmployee().getId());

        response.setEmployeeName(
            payroll.getEmployee().getFirstName() + " " +
            payroll.getEmployee().getLastName()
        );

        response.setPayrollMonth(payroll.getPayrollMonth());
        response.setPayrollYear(payroll.getPayrollYear());

        response.setBasicSalary(payroll.getBasicSalary());
        response.setHra(payroll.getHra());
        response.setDa(payroll.getDa());
        response.setOtherAllowances(payroll.getOtherAllowances());
        response.setGrossSalary(payroll.getGrossSalary());

        response.setPf(payroll.getPf());
        response.setEsi(payroll.getEsi());
        response.setOtherDeductions(payroll.getOtherDeductions());
        response.setTotalDeductions(payroll.getTotalDeductions());

        response.setNetSalary(payroll.getNetSalary());
        response.setStatus(payroll.getStatus());
        response.setPaymentDate(payroll.getPaymentDate());
        response.setCreatedAt(payroll.getCreatedAt());

        return response;
    }
}
