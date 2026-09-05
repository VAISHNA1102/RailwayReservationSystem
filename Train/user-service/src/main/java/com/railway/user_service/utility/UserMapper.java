package com.railway.user_service.utility;

import com.railway.user_service.dto.UserDTO;
import com.railway.user_service.entity.User;
import com.railway.user_service.dto.UserRequestDTO;


public class UserMapper {
    private UserMapper() {
    }

    public static User mapToEntity(UserRequestDTO userRequestDTO) {
        return User.builder()
                .userName(userRequestDTO.getUserName())
                .email(userRequestDTO.getEmail())
                .password(userRequestDTO.getPassword())
                .build();
    }

    public static UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .userId(user.getUserId())
                .userName(user.getUserName())
                .email(user.getEmail())
                .password(user.getPassword())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .build();
    }
}