
package com.payroll.payslip;

import java.io.ByteArrayOutputStream;
import java.text.NumberFormat;
import java.time.Month;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.payroll.entity.Employee;
import com.payroll.entity.Payroll;
import com.payroll.exception.ResourceNotFoundException;
import com.payroll.repository.PayrollRepository;

@Service
public class PayslipService {

    private final PayrollRepository payrollRepository;

    public PayslipService(PayrollRepository payrollRepository) {
        this.payrollRepository = payrollRepository;
    }

    @Transactional(readOnly = true)
    public byte[] generatePayslip(Long payrollId) {

        Payroll payroll = payrollRepository.findById(payrollId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payroll record not found with ID: " + payrollId));

        Employee employee = payroll.getEmployee();

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            PdfWriter writer = new PdfWriter(outputStream);
            PdfDocument pdfDocument = new PdfDocument(writer);
            Document document = new Document(pdfDocument, PageSize.A4);

            document.setMargins(40, 40, 40, 40);

            NumberFormat currency = NumberFormat.getNumberInstance(Locale.US);
            currency.setMinimumFractionDigits(2);
            currency.setMaximumFractionDigits(2);

            // Company heading
            Paragraph heading = new Paragraph("EMPLOYEE PAYSLIP")
                    .setBold()
                    .setFontSize(22)
                    .setTextAlignment(TextAlignment.CENTER);

            document.add(heading);

            document.add(new Paragraph(
                    "Salary Statement - "
                    + Month.of(payroll.getPayrollMonth()).name()
                    + " " + payroll.getPayrollYear())
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontSize(13));

            document.add(new Paragraph("\nEMPLOYEE DETAILS")
                    .setBold()
                    .setFontSize(14));

            // Employee information
            Table employeeTable = new Table(2).useAllAvailableWidth();

            addRow(employeeTable, "Employee ID", employee.getId().toString());
            addRow(employeeTable, "Employee Name",
                    employee.getFirstName() + " " + employee.getLastName());
            addRow(employeeTable, "Email", safe(employee.getEmail()));
            addRow(employeeTable, "Phone", safe(employee.getPhone()));
            addRow(employeeTable, "Department", safe(employee.getDepartment()));
            addRow(employeeTable, "Designation", safe(employee.getDesignation()));

            document.add(employeeTable);

            document.add(new Paragraph("\nSALARY DETAILS")
                    .setBold()
                    .setFontSize(14));

            // Earnings and deductions
            Table salaryTable = new Table(2).useAllAvailableWidth();

            salaryTable.addHeaderCell(new Cell().add(
                    new Paragraph("Earnings").setBold()));
            salaryTable.addHeaderCell(new Cell().add(
                    new Paragraph("Amount (INR)").setBold()));

            addRow(salaryTable, "Basic Salary",
                    format(currency, payroll.getBasicSalary()));
            addRow(salaryTable, "HRA",
                    format(currency, payroll.getHra()));
            addRow(salaryTable, "DA",
                    format(currency, payroll.getDa()));
            addRow(salaryTable, "Other Allowances",
                    format(currency, payroll.getOtherAllowances()));
            addRow(salaryTable, "Gross Salary",
                    format(currency, payroll.getGrossSalary()));

            salaryTable.addCell(new Cell().add(
                    new Paragraph("Deductions").setBold()));
            salaryTable.addCell(new Cell().add(
                    new Paragraph("Amount (INR)").setBold()));

            addRow(salaryTable, "PF",
                    format(currency, payroll.getPf()));
            addRow(salaryTable, "ESI",
                    format(currency, payroll.getEsi()));
            addRow(salaryTable, "Other Deductions",
                    format(currency, payroll.getOtherDeductions()));
            addRow(salaryTable, "Total Deductions",
                    format(currency, payroll.getTotalDeductions()));

            document.add(salaryTable);

            // Net salary
            document.add(new Paragraph(
                    "\nNET SALARY: INR "
                    + format(currency, payroll.getNetSalary()))
                    .setBold()
                    .setFontSize(17)
                    .setTextAlignment(TextAlignment.RIGHT));

            document.add(new Paragraph(
                    "Payroll Status: " + safe(payroll.getStatus())));

            document.add(new Paragraph(
                    "Payment Date: "
                    + (payroll.getPaymentDate() == null
                    ? "Not yet paid" : payroll.getPaymentDate().toString())));

            document.add(new Paragraph(
                    "\nThis is a computer-generated payslip."));

            document.close();

            return outputStream.toByteArray();

        } catch (Exception exception) {
            throw new IllegalStateException(
                    "Unable to generate payslip PDF.", exception);
        }
    }

@Transactional(readOnly = true)
public byte[] generateMyPayslip(Long payrollId, String username) {

    Payroll payroll = payrollRepository.findById(payrollId)
            .orElseThrow(() -> new ResourceNotFoundException(
                    "Payroll record not found with ID: " + payrollId));

    String employeeUsername = payroll.getEmployee()
            .getUser()
            .getUsername();

    if (!employeeUsername.equals(username)) {
        throw new org.springframework.security.access.AccessDeniedException(
                "You are not authorized to download this payslip.");
    }

    return generatePayslip(payrollId);
}


    private void addRow(Table table, String label, String value) {
        table.addCell(new Cell().add(new Paragraph(label)));
        table.addCell(new Cell().add(new Paragraph(value)));
    }

    private String format(NumberFormat currency, Double amount) {
        return currency.format(amount == null ? 0.0 : amount);
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "Not provided" : value;
    }
}
