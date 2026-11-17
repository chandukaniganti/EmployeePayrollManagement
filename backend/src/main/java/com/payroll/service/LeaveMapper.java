
package com.payroll.service;

import org.springframework.stereotype.Component;

import com.payroll.dto.LeaveResponse;
import com.payroll.entity.Leave;

@Component
public class LeaveMapper {

    public LeaveResponse toResponse(Leave leave) {

        LeaveResponse response = new LeaveResponse();

        response.setId(leave.getId());
        response.setEmployeeId(leave.getEmployee().getId());

        String firstName = leave.getEmployee().getFirstName();
        String lastName = leave.getEmployee().getLastName();

        response.setEmployeeName(
                firstName + " " + lastName);

        response.setLeaveType(leave.getLeaveType());
        response.setStartDate(leave.getStartDate());
        response.setEndDate(leave.getEndDate());
        response.setReason(leave.getReason());
        response.setStatus(leave.getStatus());
        response.setAppliedAt(leave.getAppliedAt());
        response.setReviewedAt(leave.getReviewedAt());
        response.setReviewedBy(leave.getReviewedBy());
        response.setReviewRemarks(leave.getReviewRemarks());

        return response;
    }
}
