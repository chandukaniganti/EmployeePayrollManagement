
package com.payroll.service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.payroll.dto.AttendanceRequest;
import com.payroll.dto.AttendanceResponse;
import com.payroll.dto.MonthlyAttendanceReportResponse;
import com.payroll.entity.Attendance;
import com.payroll.entity.Employee;
import com.payroll.exception.ResourceNotFoundException;
import com.payroll.repository.AttendanceRepository;
import com.payroll.repository.EmployeeRepository;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final AttendanceMapper attendanceMapper;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository,
            AttendanceMapper attendanceMapper) {

        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.attendanceMapper = attendanceMapper;
    }

    private Employee getLinkedEmployee(String username) {

        return employeeRepository.findByUserUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No employee record linked to username: " + username));
    }

    // Calculate working hours and validate attendance times
    private void calculateAttendance(Attendance attendance) {

        LocalTime checkIn = attendance.getCheckIn();
        LocalTime checkOut = attendance.getCheckOut();

        if (checkIn == null && checkOut != null) {
            throw new IllegalArgumentException(
                    "Check-in time is required when check-out time is provided.");
        }

        if (checkIn != null && checkOut != null) {

            if (checkOut.isBefore(checkIn)) {
                throw new IllegalArgumentException(
                        "Check-out time cannot be before check-in time.");
            }

            long minutes = Duration.between(checkIn, checkOut).toMinutes();
            double hours = minutes / 60.0;

            attendance.setTotalHours(
                    Math.round(hours * 100.0) / 100.0);

            if (!"ABSENT".equals(attendance.getStatus())) {
                attendance.setStatus(hours < 4.0 ? "HALF_DAY" : "PRESENT");
            }

        } else {
            attendance.setTotalHours(null);
        }
    }

    private void validateStatus(String status) {

        if (status == null ||
                !List.of("PRESENT", "ABSENT", "HALF_DAY").contains(status)) {

            throw new IllegalArgumentException(
                    "Invalid attendance status. Use PRESENT, ABSENT or HALF_DAY.");
        }
    }

    // Employee Check-In
    @Transactional
    public AttendanceResponse checkIn(String username) {

        Employee employee = getLinkedEmployee(username);

        LocalDate today = LocalDate.now();

        if (attendanceRepository
                .findByEmployeeIdAndAttendanceDate(employee.getId(), today)
                .isPresent()) {

            throw new IllegalStateException(
                    "Attendance already exists for today.");
        }

        Attendance attendance = new Attendance();

        attendance.setEmployee(employee);
        attendance.setAttendanceDate(today);
        attendance.setCheckIn(LocalTime.now());
        attendance.setStatus("PRESENT");

        Attendance savedAttendance = attendanceRepository.save(attendance);

        return attendanceMapper.toResponse(savedAttendance);
    }

    // Employee Check-Out
    @Transactional
    public AttendanceResponse checkOut(String username) {

        Employee employee = getLinkedEmployee(username);

        LocalDate today = LocalDate.now();

        Attendance attendance = attendanceRepository
                .findByEmployeeIdAndAttendanceDate(employee.getId(), today)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No check-in record found for today."));

        if (attendance.getCheckOut() != null) {
            throw new IllegalStateException(
                    "Employee has already checked out.");
        }

        LocalTime checkOutTime = LocalTime.now();

        if (checkOutTime.isBefore(attendance.getCheckIn())) {
            throw new IllegalStateException(
                    "Check-out time cannot be before check-in time.");
        }

        attendance.setCheckOut(checkOutTime);

        calculateAttendance(attendance);

        Attendance savedAttendance = attendanceRepository.save(attendance);

        return attendanceMapper.toResponse(savedAttendance);
    }

    // Employee: View own attendance
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getMyAttendance(String username) {

        Employee employee = getLinkedEmployee(username);

        return attendanceRepository.findByEmployeeId(employee.getId())
                .stream()
                .map(attendanceMapper::toResponse)
                .toList();
    }

    // ADMIN / HR: Add attendance
    @Transactional
    public AttendanceResponse createAttendance(AttendanceRequest request) {

        if (request.getEmployeeId() == null) {
            throw new IllegalArgumentException("Employee ID is required.");
        }

        if (request.getAttendanceDate() == null) {
            throw new IllegalArgumentException("Attendance date is required.");
        }

        validateStatus(request.getStatus());

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee not found with ID: " + request.getEmployeeId()));

        if (attendanceRepository.findByEmployeeIdAndAttendanceDate(
                employee.getId(),
                request.getAttendanceDate()).isPresent()) {

            throw new IllegalStateException(
                    "Attendance already exists for this employee on this date.");
        }

        Attendance attendance = new Attendance();

        attendance.setEmployee(employee);
        attendance.setAttendanceDate(request.getAttendanceDate());
        attendance.setCheckIn(request.getCheckIn());
        attendance.setCheckOut(request.getCheckOut());
        attendance.setStatus(request.getStatus());

        calculateAttendance(attendance);

        return attendanceMapper.toResponse(
                attendanceRepository.save(attendance));
    }

    // ADMIN / HR: Update attendance
    @Transactional
    public AttendanceResponse updateAttendance(
            Long attendanceId,
            AttendanceRequest request) {

        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attendance not found with ID: " + attendanceId));

        if (request.getEmployeeId() == null ||
                request.getAttendanceDate() == null) {

            throw new IllegalArgumentException(
                    "Employee ID and attendance date are required.");
        }

        validateStatus(request.getStatus());

        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Employee not found with ID: " + request.getEmployeeId()));

        attendanceRepository.findByEmployeeIdAndAttendanceDate(
                employee.getId(),
                request.getAttendanceDate()
        ).ifPresent(existing -> {
            if (!existing.getId().equals(attendanceId)) {
                throw new IllegalStateException(
                        "Attendance already exists for this employee on this date.");
            }
        });

        attendance.setEmployee(employee);
        attendance.setAttendanceDate(request.getAttendanceDate());
        attendance.setCheckIn(request.getCheckIn());
        attendance.setCheckOut(request.getCheckOut());
        attendance.setStatus(request.getStatus());

        calculateAttendance(attendance);

        return attendanceMapper.toResponse(
                attendanceRepository.save(attendance));
    }

    // ADMIN / HR: Delete attendance
    @Transactional
    public void deleteAttendance(Long attendanceId) {

        Attendance attendance = attendanceRepository.findById(attendanceId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attendance not found with ID: " + attendanceId));

        attendanceRepository.delete(attendance);
    }

    // ADMIN / HR: Get all attendance records
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAllAttendance() {

        return attendanceRepository.findAll()
                .stream()
                .map(attendanceMapper::toResponse)
                .toList();
    }

    // ADMIN / HR: Get attendance by employee
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByEmployee(Long employeeId) {

        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException(
                    "Employee not found with ID: " + employeeId);
        }

        return attendanceRepository.findByEmployeeId(employeeId)
                .stream()
                .map(attendanceMapper::toResponse)
                .toList();
    }

    // ADMIN / HR: Get attendance by date
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByDate(LocalDate date) {

        return attendanceRepository.findByAttendanceDate(date)
                .stream()
                .map(attendanceMapper::toResponse)
                .toList();
    }

    // ADMIN / HR: Get attendance within date range
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAttendanceByDateRange(
            Long employeeId,
            LocalDate startDate,
            LocalDate endDate) {

        if (!employeeRepository.existsById(employeeId)) {
            throw new ResourceNotFoundException(
                    "Employee not found with ID: " + employeeId);
        }

        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException(
                    "Start date cannot be after end date.");
        }

        return attendanceRepository
                .findByEmployeeIdAndAttendanceDateBetween(
                        employeeId,
                        startDate,
                        endDate
                )
                .stream()
                .map(attendanceMapper::toResponse)
                .toList();
    }

    // ADMIN / HR: Monthly attendance report
    @Transactional(readOnly = true)
    public List<MonthlyAttendanceReportResponse> getMonthlyAttendanceReport(
            int month,
            int year) {

        YearMonth yearMonth;

        try {
            yearMonth = YearMonth.of(year, month);
        } catch (java.time.DateTimeException exception) {
            throw new IllegalArgumentException(
                    "Invalid month or year supplied.");
        }

        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<AttendanceResponse> records = attendanceRepository
                .findByAttendanceDateBetween(startDate, endDate)
                .stream()
                .map(attendanceMapper::toResponse)
                .toList();

        Map<Long, MonthlyAttendanceReportResponse> reportMap =
                new LinkedHashMap<>();

        for (AttendanceResponse record : records) {

            Long employeeId = record.getEmployeeId();

            MonthlyAttendanceReportResponse report =
                    reportMap.computeIfAbsent(employeeId, id -> {

                        MonthlyAttendanceReportResponse newReport =
                                new MonthlyAttendanceReportResponse();

                        newReport.setEmployeeId(employeeId);
                        newReport.setEmployeeName(record.getEmployeeName());

                        return newReport;
                    });

            report.setTotalRecords(report.getTotalRecords() + 1);

            if ("PRESENT".equals(record.getStatus())) {
                report.setPresentDays(report.getPresentDays() + 1);

            } else if ("ABSENT".equals(record.getStatus())) {
                report.setAbsentDays(report.getAbsentDays() + 1);

            } else if ("HALF_DAY".equals(record.getStatus())) {
                report.setHalfDays(report.getHalfDays() + 1);
            }

            if (record.getTotalHours() != null) {
                report.setTotalHours(
                        report.getTotalHours() + record.getTotalHours());
            }
        }

        List<MonthlyAttendanceReportResponse> reports =
                new ArrayList<>(reportMap.values());

        for (MonthlyAttendanceReportResponse report : reports) {
            report.setTotalHours(
                    Math.round(report.getTotalHours() * 100.0) / 100.0);
        }

        return reports;
    }
}
