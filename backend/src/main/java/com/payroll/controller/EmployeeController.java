
package com.payroll.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.payroll.dto.EmployeeUserLinkRequest;
import com.payroll.entity.Employee;
import com.payroll.service.EmployeeService;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin(origins = "${app.cors.allowed-origins}")
@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    // GET: Get all employees
    @GetMapping
    public List<Employee> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    // GET: Get employee by ID
    @GetMapping("/{id}")
    public Employee getEmployeeById(@PathVariable Long id) {
        return employeeService.getEmployeeById(id);
    }

    // POST: Add employee profile only
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Employee createEmployee(@RequestBody Employee employee) {
        return employeeService.saveEmployee(employee);
    }

    // POST: Add employee with login account
    @PostMapping("/create-with-account")
    @ResponseStatus(HttpStatus.CREATED)
    public Employee createEmployeeWithAccount(
            @RequestBody EmployeeAccountRequest request) {

        return employeeService.createEmployeeWithAccount(
                request.getEmployee(),
                request.getUsername(),
                request.getPassword()
        );
    }

    // PUT: Update employee
    @PutMapping("/{id}")
    public Employee updateEmployee(
            @PathVariable Long id,
            @RequestBody Employee employee) {

        return employeeService.updateEmployee(id, employee);
    }

    // DELETE: Delete employee
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
    }

    // Link an existing user account to an employee
    @PutMapping("/{employeeId}/link-user")
    public Employee linkUserToEmployee(
            @PathVariable Long employeeId,
            @RequestBody EmployeeUserLinkRequest request) {

        return employeeService.linkUserToEmployee(
                employeeId,
                request.getUserId()
        );
    }

    // Request body for employee and login account creation
    public static class EmployeeAccountRequest {

        private Employee employee;
        private String username;
        private String password;

        public EmployeeAccountRequest() {
        }

        public Employee getEmployee() {
            return employee;
        }

        public void setEmployee(Employee employee) {
            this.employee = employee;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}
