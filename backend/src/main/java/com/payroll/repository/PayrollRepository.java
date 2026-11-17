
package com.payroll.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.payroll.entity.Payroll;

@Repository
public interface PayrollRepository extends JpaRepository<Payroll, Long> {

    List<Payroll> findByEmployeeId(Long employeeId);

    List<Payroll> findByPayrollMonthAndPayrollYear(
        Integer payrollMonth,
        Integer payrollYear
    );

    Optional<Payroll> findByEmployeeIdAndPayrollMonthAndPayrollYear(
        Long employeeId,
        Integer payrollMonth,
        Integer payrollYear
    );
}
