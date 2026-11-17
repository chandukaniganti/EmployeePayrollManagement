
package com.payroll.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.payroll.dto.TransactionRequest;
import com.payroll.dto.TransactionResponse;
import com.payroll.entity.Payroll;
import com.payroll.entity.Transaction;
import com.payroll.exception.ResourceNotFoundException;
import com.payroll.repository.PayrollRepository;
import com.payroll.repository.TransactionRepository;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final PayrollRepository payrollRepository;
    private final TransactionMapper transactionMapper;

    public TransactionService(
            TransactionRepository transactionRepository,
            PayrollRepository payrollRepository,
            TransactionMapper transactionMapper) {
        this.transactionRepository = transactionRepository;
        this.payrollRepository = payrollRepository;
        this.transactionMapper = transactionMapper;
    }

    @Transactional
    public TransactionResponse createTransaction(TransactionRequest request) {

        validateRequest(request);

        Payroll payroll = payrollRepository.findById(request.getPayrollId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payroll not found with ID: " + request.getPayrollId()));

        String reference = request.getTransactionReference().trim();

        if (transactionRepository.existsByTransactionReference(reference)) {
            throw new IllegalArgumentException(
                    "Transaction reference already exists.");
        }

        if (Double.compare(request.getAmount(), payroll.getNetSalary()) != 0) {
            throw new IllegalArgumentException(
                    "Transaction amount must match the payroll net salary.");
        }

        String status = request.getStatus().trim().toUpperCase(Locale.ROOT);

        if ("SUCCESS".equals(status) && "PAID".equalsIgnoreCase(payroll.getStatus())) {
            throw new IllegalArgumentException(
                    "This payroll has already been paid successfully.");
        }

        Transaction transaction = new Transaction();
        transaction.setEmployee(payroll.getEmployee());
        transaction.setPayroll(payroll);
        transaction.setTransactionReference(reference);
        transaction.setPaymentMethod(
                request.getPaymentMethod().trim().toUpperCase(Locale.ROOT));
        transaction.setAmount(request.getAmount());
        transaction.setStatus(status);
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setRemarks(request.getRemarks());

        Transaction savedTransaction = transactionRepository.save(transaction);

        if ("SUCCESS".equals(status)) {
            payroll.setStatus("PAID");
            payroll.setPaymentDate(LocalDate.now());
            payrollRepository.save(payroll);
        }

        return transactionMapper.toResponse(savedTransaction);
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getAllTransactions() {

        return transactionRepository.findAll()
                .stream()
                .map(transactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getMyTransactions(String username) {

        return transactionRepository.findByEmployeeUserUsername(username)
                .stream()
                .map(transactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByEmployee(Long employeeId) {

        return transactionRepository.findByEmployeeId(employeeId)
                .stream()
                .map(transactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TransactionResponse> getTransactionsByStatus(String status) {

        if (status == null || !status.trim().toUpperCase(Locale.ROOT)
                .matches("PENDING|SUCCESS|FAILED")) {
            throw new IllegalArgumentException(
                    "Status must be PENDING, SUCCESS, or FAILED.");
        }

        return transactionRepository.findByStatus(
                        status.trim().toUpperCase(Locale.ROOT))
                .stream()
                .map(transactionMapper::toResponse)
                .collect(Collectors.toList());
    }

    private void validateRequest(TransactionRequest request) {

        if (request == null) {
            throw new IllegalArgumentException(
                    "Transaction details are required.");
        }

        if (request.getPayrollId() == null) {
            throw new IllegalArgumentException("Payroll ID is required.");
        }

        if (request.getTransactionReference() == null
                || request.getTransactionReference().isBlank()) {
            throw new IllegalArgumentException(
                    "Transaction reference is required.");
        }

        if (request.getTransactionReference().trim().length() > 30) {
            throw new IllegalArgumentException(
                    "Transaction reference cannot exceed 30 characters.");
        }

        if (request.getPaymentMethod() == null
                || !request.getPaymentMethod().trim().toUpperCase(Locale.ROOT)
                        .matches("NEFT|IMPS|RTGS|UPI")) {
            throw new IllegalArgumentException(
                    "Payment method must be NEFT, IMPS, RTGS, or UPI.");
        }

        if (request.getAmount() == null
                || !Double.isFinite(request.getAmount())
                || request.getAmount() <= 0) {
            throw new IllegalArgumentException(
                    "Transaction amount must be greater than zero.");
        }

        if (request.getStatus() == null
                || !request.getStatus().trim().toUpperCase(Locale.ROOT)
                        .matches("PENDING|SUCCESS|FAILED")) {
            throw new IllegalArgumentException(
                    "Status must be PENDING, SUCCESS, or FAILED.");
        }

        if (request.getRemarks() != null
                && request.getRemarks().length() > 500) {
            throw new IllegalArgumentException(
                    "Remarks cannot exceed 500 characters.");
        }
    }
}
