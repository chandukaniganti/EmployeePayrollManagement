
package com.payroll.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.payroll.dto.LeaveRequest;
import com.payroll.dto.LeaveResponse;
import com.payroll.dto.LeaveReviewRequest;
import com.payroll.service.LeaveService;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin(origins = "http://localhost:5173")
public class LeaveController {

    private final LeaveService leaveService;

    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    // Employee: Apply for leave
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    @ResponseStatus(HttpStatus.CREATED)
    public LeaveResponse applyLeave(
            @RequestBody LeaveRequest request,
            Authentication authentication) {

        return leaveService.applyLeave(
                authentication.getName(),
                request);
    }

    // Employee: View own leave applications
    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<LeaveResponse> getMyLeaves(
            Authentication authentication) {

        return leaveService.getMyLeaves(authentication.getName());
    }

    // ADMIN / HR: View all leave applications
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public List<LeaveResponse> getAllLeaves() {

        return leaveService.getAllLeaves();
    }

    // ADMIN / HR: View leave applications by status
    @GetMapping("/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public List<LeaveResponse> getLeavesByStatus(
            @RequestParam String status) {

        return leaveService.getLeavesByStatus(status);
    }

    // ADMIN / HR: Approve or reject a leave application
    @PostMapping("/{leaveId}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public LeaveResponse reviewLeave(
            @PathVariable Long leaveId,
            @RequestBody LeaveReviewRequest request,
            Authentication authentication) {

        return leaveService.reviewLeave(
                leaveId,
                request,
                authentication.getName());
    }

    // ADMIN / HR: View leave applications by employee
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public List<LeaveResponse> getLeavesByEmployee(
            @PathVariable Long employeeId) {

        return leaveService.getLeavesByEmployee(employeeId);
    }
}
