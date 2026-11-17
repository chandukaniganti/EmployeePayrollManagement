
package com.payroll.service;

import org.springframework.stereotype.Component;

import com.payroll.dto.TransactionResponse;
import com.payroll.entity.Transaction;

@Component
public class TransactionMapper {

    public TransactionResponse toResponse(Transaction transaction) {

        TransactionResponse response = new TransactionResponse();

        response.setId(transaction.getId());
        response.setEmployeeId(transaction.getEmployee().getId());

        response.setEmployeeName(
                transaction.getEmployee().getFirstName() + " "
                + transaction.getEmployee().getLastName()
        );

        response.setPayrollId(transaction.getPayroll().getId());
        response.setTransactionReference(transaction.getTransactionReference());
        response.setPaymentMethod(transaction.getPaymentMethod());
        response.setAmount(transaction.getAmount());
        response.setStatus(transaction.getStatus());
        response.setTransactionDate(transaction.getTransactionDate());
        response.setRemarks(transaction.getRemarks());

        return response;
    }
}
