
package com.payroll.service;

import org.springframework.stereotype.Component;

import com.payroll.dto.BankAccountResponse;
import com.payroll.entity.BankAccount;

@Component
public class BankAccountMapper {

    public BankAccountResponse toResponse(BankAccount bankAccount) {

        BankAccountResponse response = new BankAccountResponse();

        response.setId(bankAccount.getId());
        response.setEmployeeId(bankAccount.getEmployee().getId());
        response.setAccountHolderName(bankAccount.getAccountHolderName());

        String accountNumber = bankAccount.getAccountNumber();

        if (accountNumber != null && accountNumber.length() >= 4) {
            response.setMaskedAccountNumber(
                    "XXXX XXXX " + accountNumber.substring(accountNumber.length() - 4)
            );
        } else {
            response.setMaskedAccountNumber("XXXX");
        }

        response.setIfscCode(bankAccount.getIfscCode());
        response.setBankName(bankAccount.getBankName());
        response.setBranchName(bankAccount.getBranchName());
        response.setAccountType(bankAccount.getAccountType());

        return response;
    }
}
