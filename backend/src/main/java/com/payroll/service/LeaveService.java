
package com.payroll.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.payroll.dto.LeaveRequest;
import com.payroll.dto.LeaveResponse;
import com.payroll.dto.LeaveReviewRequest;
import com.payroll.entity.Employee;
import com.payroll.entity.Leave;
import com.payroll.exception.ResourceNotFoundException;
import com.payroll.repository.EmployeeRepository;
import com.payroll.repository.LeaveRepository;

@Service
public class LeaveService {

    private final LeaveRepository leaveRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveMapper leaveMapper;

    public LeaveService(
            LeaveRepository leaveRepository,
            EmployeeRepository employeeRepository,
            LeaveMapper leaveMapper) {

        this.leaveRepository = leaveRepository;
        this.employeeRepository = employeeRepository;
        this.leaveMapper = leaveMapper;
    }

    private Employee getLinkedEmployee(String username) {

        return employeeRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No employee record linked to username: " + username));
    }

    // Employee: Apply for leave
    @Transactional
    public LeaveResponse applyLeave(String username, LeaveRequest request) {

        if (request.getLeaveType() == null ||
                request.getLeaveType().isBlank()) {
            throw new IllegalArgumentException("Leave type is required.");
        }

        if (request.getStartDate() == null ||
                request.getEndDate() == null) {
            throw new IllegalArgumentException(
                    "Start date and end date are required.");
        }

        if (request.getStartDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Leave cannot start in the past.");
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException(
                    "End date cannot be before start date.");
        }

        if (request.getReason() == null ||
                request.getReason().isBlank() ||
                request.getReason().length() > 500) {
            throw new IllegalArgumentException(
                    "Reason is required and must not exceed 500 characters.");
        }

        Employee employee = getLinkedEmployee(username);

        Leave leave = new Leave();
        leave.setEmployee(employee);
        leave.setLeaveType(request.getLeaveType().trim().toUpperCase());
        leave.setStartDate(request.getStartDate());
        leave.setEndDate(request.getEndDate());
        leave.setReason(request.getReason().trim());
        leave.setStatus("PENDING");
        leave.setAppliedAt(LocalDateTime.now());

        Leave savedLeave = leaveRepository.save(leave);

        return leaveMapper.toResponse(savedLeave);
    }

    // Employee: View own leave applications
    @Transactional(readOnly = true)
    public List<LeaveResponse> getMyLeaves(String username) {

        Employee employee = getLinkedEmployee(username);

        return leaveRepository.findByEmployeeId(employee.getId())
                .stream()
                .map(leaveMapper::toResponse)
                .toList();
    }

    // ADMIN / HR: View all leave applications
    @Transactional(readOnly = true)
    public List<LeaveResponse> getAllLeaves() {

        return leaveRepository.findAll()
                .stream()
                .map(leaveMapper::toResponse)
                .toList();
    }

    // ADMIN / HR: View leave applications by status
    @Transactional(readOnly = true)
    public List<LeaveResponse> getLeavesByStatus(String status) {

        if (status == null ||
                !List.of("PENDING", "APPROVED", "REJECTED")
                        .contains(status.trim().toUpperCase())) {
            throw new IllegalArgumentException("Invalid leave status.");
        }

        return leaveRepository.findByStatus(status.trim().toUpperCase())
                .stream()
                .map(leaveMapper::toResponse)
                .toList();
    }

    // ADMIN / HR: Approve or reject a leave application
    @Transactional
    public LeaveResponse reviewLeave(
            Long leaveId,
            LeaveReviewRequest request,
            String reviewerUsername) {

        Leave leave = leaveRepository.findById(leaveId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Leave application not found with ID: " + leaveId));

        if (request.getStatus() == null) {
            throw new IllegalArgumentException("Review status is required.");
        }

        String status = request.getStatus().trim().toUpperCase();

        if (!status.equals("APPROVED") && !status.equals("REJECTED")) {
            throw new IllegalArgumentException(
                    "Review status must be APPROVED or REJECTED.");
        }

        if (!"PENDING".equals(leave.getStatus())) {
            throw new IllegalStateException(
                    "Only pending leave applications can be reviewed.");
        }

        if (status.equals("REJECTED") &&
                (request.getReviewRemarks() == null ||
                        request.getReviewRemarks().isBlank())) {
            throw new IllegalArgumentException(
                    "Remarks are required when rejecting leave.");
        }

        if (request.getReviewRemarks() != null &&
                request.getReviewRemarks().length() > 500) {
            throw new IllegalArgumentException(
                    "Review remarks cannot exceed 500 characters.");
        }

        leave.setStatus(status);
        leave.setReviewedAt(LocalDateTime.now());
        leave.setReviewedBy(reviewerUsername);
        leave.setReviewRemarks(
                request.getReviewRemarks() == null
                        ? null
                        : request.getReviewRemarks().trim());

        Leave savedLeave = leaveRepository.save(leave);

        return leaveMapper.toResponse(savedLeave);
    }

    // ADMIN / HR: View leave applications of a particular employee
    @Transactional(readOnly = true)
    public List<LeaveResponse> getLeavesByEmployee(Long employeeId) {

        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException(
                    "Employee not found with ID: " + employeeId);
        }

        return leaveRepository.findByEmployeeId(employeeId)
                .stream()
                .map(leaveMapper::toResponse)
                .toList();
    }
}
