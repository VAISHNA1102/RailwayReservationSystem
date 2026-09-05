package com.railway.api_gateway.dto;

import com.railway.api_gateway.utility.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserClientDTO {

    private Integer userId;
    private String userName;
    private String email;
    private String password;
    private Role role;
    private LocalDateTime createdAt;

}
