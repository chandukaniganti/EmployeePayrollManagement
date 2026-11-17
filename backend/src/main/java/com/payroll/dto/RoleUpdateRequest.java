
package com.payroll.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record RoleUpdateRequest(

        @NotBlank(message = "Role is required")
        @Pattern(
                regexp = "ADMIN|HR|EMPLOYEE",
                message = "Role must be ADMIN, HR, or EMPLOYEE"
        )
        String role

) {
}
