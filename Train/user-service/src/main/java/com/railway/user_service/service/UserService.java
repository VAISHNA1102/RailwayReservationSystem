package com.railway.user_service.service;
import com.railway.user_service.dto.UserDTO;
import com.railway.user_service.dto.UserRequestDTO;

import java.util.List;

public interface UserService {
    UserDTO addUser(UserRequestDTO userRequestDTO);

    UserDTO getUserById(Integer userId);

    List<UserDTO> getAllUsers();

    UserDTO getUserByEmail(String email);

    UserDTO getUserByUserName(String userName);

    String deleteUserByUserName(String userName);

    long countAllUsers();

    String changePassword(String username, String oldPassword, String newPassword);

}
