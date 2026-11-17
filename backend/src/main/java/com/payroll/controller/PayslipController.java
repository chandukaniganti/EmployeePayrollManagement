
package com.payroll.controller;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.payroll.payslip.PayslipService;

@RestController
@RequestMapping("/api/payslips")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
public class PayslipController {

    private final PayslipService payslipService;

    public PayslipController(PayslipService payslipService) {
        this.payslipService = payslipService;
    }

    // ADMIN and HR: Download any employee's payslip
    @GetMapping("/{payrollId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public ResponseEntity<byte[]> downloadPayslip(
            @PathVariable Long payrollId) {

        byte[] pdf = payslipService.generatePayslip(payrollId);

        return createPdfResponse(pdf, payrollId);
    }

    // EMPLOYEE: Download only their own payslip
    @GetMapping("/my/{payrollId}")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<byte[]> downloadMyPayslip(
            @PathVariable Long payrollId,
            Authentication authentication) {

        byte[] pdf = payslipService.generateMyPayslip(
                payrollId, authentication.getName());

        return createPdfResponse(pdf, payrollId);
    }

    private ResponseEntity<byte[]> createPdfResponse(
            byte[] pdf, Long payrollId) {

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=payslip-" + payrollId + ".pdf")
                .body(pdf);
    }
}
