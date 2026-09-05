package com.railway.user_service.dto;


import com.railway.user_service.entity.Role;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Integer userId;
    private String userName;
    private String email;
    private String password;
    private Role role;
    private LocalDateTime createdAt;


}
