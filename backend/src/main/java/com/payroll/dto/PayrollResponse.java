
package com.payroll.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class PayrollResponse {

    private Long id;
    private Long employeeId;
    private String employeeName;
    private Integer payrollMonth;
    private Integer payrollYear;

    private Double basicSalary;
    private Double hra;
    private Double da;
    private Double otherAllowances;
    private Double grossSalary;

    private Double pf;
    private Double esi;
    private Double otherDeductions;
    private Double totalDeductions;

    private Double netSalary;
    private String status;
    private LocalDate paymentDate;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public Integer getPayrollMonth() {
        return payrollMonth;
    }

    public void setPayrollMonth(Integer payrollMonth) {
        this.payrollMonth = payrollMonth;
    }

    public Integer getPayrollYear() {
        return payrollYear;
    }

    public void setPayrollYear(Integer payrollYear) {
        this.payrollYear = payrollYear;
    }

    public Double getBasicSalary() {
        return basicSalary;
    }

    public void setBasicSalary(Double basicSalary) {
        this.basicSalary = basicSalary;
    }

    public Double getHra() {
        return hra;
    }

    public void setHra(Double hra) {
        this.hra = hra;
    }

    public Double getDa() {
        return da;
    }

    public void setDa(Double da) {
        this.da = da;
    }

    public Double getOtherAllowances() {
        return otherAllowances;
    }

    public void setOtherAllowances(Double otherAllowances) {
        this.otherAllowances = otherAllowances;
    }

    public Double getGrossSalary() {
        return grossSalary;
    }

    public void setGrossSalary(Double grossSalary) {
        this.grossSalary = grossSalary;
    }

    public Double getPf() {
        return pf;
    }

    public void setPf(Double pf) {
        this.pf = pf;
    }

    public Double getEsi() {
        return esi;
    }

    public void setEsi(Double esi) {
        this.esi = esi;
    }

    public Double getOtherDeductions() {
        return otherDeductions;
    }

    public void setOtherDeductions(Double otherDeductions) {
        this.otherDeductions = otherDeductions;
    }

    public Double getTotalDeductions() {
        return totalDeductions;
    }

    public void setTotalDeductions(Double totalDeductions) {
        this.totalDeductions = totalDeductions;
    }

    public Double getNetSalary() {
        return netSalary;
    }

    public void setNetSalary(Double netSalary) {
        this.netSalary = netSalary;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
