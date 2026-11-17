
package com.payroll.service;

import org.springframework.stereotype.Component;

import com.payroll.dto.AttendanceResponse;
import com.payroll.entity.Attendance;

@Component
public class AttendanceMapper {

    public AttendanceResponse toResponse(Attendance attendance) {

        AttendanceResponse response = new AttendanceResponse();

        response.setId(attendance.getId());
        response.setEmployeeId(attendance.getEmployee().getId());

        response.setEmployeeName(
                attendance.getEmployee().getFirstName()
                + " "
                + attendance.getEmployee().getLastName()
        );

        response.setAttendanceDate(attendance.getAttendanceDate());
        response.setCheckIn(attendance.getCheckIn());
        response.setCheckOut(attendance.getCheckOut());
        response.setTotalHours(attendance.getTotalHours());
        response.setStatus(attendance.getStatus());

        return response;
    }
}
