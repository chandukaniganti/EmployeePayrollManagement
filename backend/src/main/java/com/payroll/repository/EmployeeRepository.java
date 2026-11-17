
package com.payroll.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.payroll.entity.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    // Find an employee using email
    Employee findByEmail(String email);

    // Check whether an employee email already exists
    boolean existsByEmail(String email);

    Optional<Employee> findByUserUsername(String username);
}
