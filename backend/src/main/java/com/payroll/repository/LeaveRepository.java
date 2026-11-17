
package com.payroll.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.payroll.entity.Leave;

@Repository
public interface LeaveRepository extends JpaRepository<Leave, Long> {

    // Find all leave applications of an employee
    List<Leave> findByEmployeeId(Long employeeId);

    // Find leave applications by employee username
    List<Leave> findByEmployeeUserUsername(String username);

    // Find all leave applications by status
    List<Leave> findByStatus(String status);

    // Find all leave applications of an employee by status
    List<Leave> findByEmployeeIdAndStatus(Long employeeId, String status);
}
