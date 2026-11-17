
package com.payroll.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.payroll.entity.Employee;
import com.payroll.entity.User;
import com.payroll.exception.ResourceNotFoundException;
import com.payroll.repository.EmployeeRepository;
import com.payroll.repository.UserRepository;

@Service
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public EmployeeService(
            EmployeeRepository employeeRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Get all employees
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    // Get employee by ID
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee not found with ID: " + id));
    }

    // Create employee profile only
    public Employee saveEmployee(Employee employee) {

        if (employeeRepository.existsByEmail(employee.getEmail())) {
            throw new IllegalStateException(
                    "Employee email already registered!");
        }

        return employeeRepository.save(employee);
    }

    // Create employee and login account together
    @Transactional
    public Employee createEmployeeWithAccount(
            Employee employee,
            String username,
            String rawPassword) {

        if (employeeRepository.existsByEmail(employee.getEmail())) {
            throw new IllegalStateException(
                    "Employee email already registered!");
        }

        if (userRepository.existsByUsername(username)) {
            throw new IllegalStateException(
                    "Username already exists!");
        }

        if (userRepository.existsByEmail(employee.getEmail())) {
            throw new IllegalStateException(
                    "This email is already used by another user account!");
        }

        if (username == null || username.isBlank()) {
            throw new IllegalArgumentException(
                    "Username is required!");
        }

        if (rawPassword == null || rawPassword.isBlank()) {
            throw new IllegalArgumentException(
                    "Password is required!");
        }

        User user = new User();
        user.setUsername(username.trim());
        user.setEmail(employee.getEmail());
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole("EMPLOYEE");

        user = userRepository.save(user);

        employee.setUser(user);

        return employeeRepository.save(employee);
    }

    // Update employee
    public Employee updateEmployee(Long id, Employee updatedEmployee) {

        Employee existingEmployee = getEmployeeById(id);

        existingEmployee.setFirstName(updatedEmployee.getFirstName());
        existingEmployee.setLastName(updatedEmployee.getLastName());
        existingEmployee.setEmail(updatedEmployee.getEmail());
        existingEmployee.setPhone(updatedEmployee.getPhone());
        existingEmployee.setDepartment(updatedEmployee.getDepartment());
        existingEmployee.setDesignation(updatedEmployee.getDesignation());
        existingEmployee.setDateOfJoining(updatedEmployee.getDateOfJoining());
        existingEmployee.setBasicSalary(updatedEmployee.getBasicSalary());

        return employeeRepository.save(existingEmployee);
    }

    // Link an existing user account to an employee
    @Transactional
    public Employee linkUserToEmployee(Long employeeId, Long userId) {

        Employee employee = getEmployeeById(employeeId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "User not found with ID: " + userId));

        if (employee.getUser() != null) {
            throw new IllegalStateException(
                    "This employee already has a linked user account.");
        }

        if (employeeRepository.findByUserUsername(user.getUsername()).isPresent()) {
            throw new IllegalStateException(
                    "This user is already linked to another employee.");
        }

        employee.setUser(user);

        return employeeRepository.save(employee);
    }

    // Delete employee
    public void deleteEmployee(Long id) {
        Employee employee = getEmployeeById(id);
        employeeRepository.delete(employee);
    }
}
