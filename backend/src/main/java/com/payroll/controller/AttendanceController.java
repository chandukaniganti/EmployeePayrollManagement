
package com.payroll.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.payroll.dto.AttendanceRequest;
import com.payroll.dto.AttendanceResponse;
import com.payroll.dto.MonthlyAttendanceReportResponse;
import com.payroll.service.AttendanceService;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin(origins = "http://localhost:5173")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    // Employee: Check-In
    @PostMapping("/check-in")
    @PreAuthorize("hasRole('EMPLOYEE')")
    @ResponseStatus(HttpStatus.CREATED)
    public AttendanceResponse checkIn(Authentication authentication) {
        return attendanceService.checkIn(authentication.getName());
    }

    // Employee: Check-Out
    @PostMapping("/check-out")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public AttendanceResponse checkOut(Authentication authentication) {
        return attendanceService.checkOut(authentication.getName());
    }

    // Employee: View Own Attendance
    @GetMapping("/my")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<AttendanceResponse> getMyAttendance(
            Authentication authentication) {
        return attendanceService.getMyAttendance(authentication.getName());
    }

    // ADMIN / HR: Add Attendance
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @ResponseStatus(HttpStatus.CREATED)
    public AttendanceResponse createAttendance(
            @RequestBody AttendanceRequest request) {
        return attendanceService.createAttendance(request);
    }

    // ADMIN / HR: Update Attendance
    @PutMapping("/{attendanceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public AttendanceResponse updateAttendance(
            @PathVariable Long attendanceId,
            @RequestBody AttendanceRequest request) {
        return attendanceService.updateAttendance(attendanceId, request);
    }

    // ADMIN / HR: Delete Attendance
    @DeleteMapping("/{attendanceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAttendance(@PathVariable Long attendanceId) {
        attendanceService.deleteAttendance(attendanceId);
    }

    // ADMIN / HR: View All Attendance
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public List<AttendanceResponse> getAllAttendance() {
        return attendanceService.getAllAttendance();
    }

    // ADMIN / HR: View Attendance By Employee
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public List<AttendanceResponse> getAttendanceByEmployee(
            @PathVariable Long employeeId) {
        return attendanceService.getAttendanceByEmployee(employeeId);
    }

    // ADMIN / HR: View Attendance By Date
    @GetMapping("/date")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public List<AttendanceResponse> getAttendanceByDate(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date) {
        return attendanceService.getAttendanceByDate(date);
    }

    // ADMIN / HR: View Attendance By Employee And Date Range
    @GetMapping("/employee/{employeeId}/range")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public List<AttendanceResponse> getAttendanceByDateRange(
            @PathVariable Long employeeId,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate startDate,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate endDate) {
        return attendanceService.getAttendanceByDateRange(
                employeeId, startDate, endDate);

                
    }

    @GetMapping("/monthly-report")
@PreAuthorize("hasAnyRole('ADMIN', 'HR')")
public List<MonthlyAttendanceReportResponse> getMonthlyAttendanceReport(
        @RequestParam int month,
        @RequestParam int year) {

    return attendanceService.getMonthlyAttendanceReport(month, year);
}
}
