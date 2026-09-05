package com.railway.user_service.service;

import com.railway.user_service.entity.User;
import com.railway.user_service.repository.UserRepository;
import com.railway.user_service.utility.UserMapper;
import com.railway.user_service.dto.UserRequestDTO;
import com.railway.user_service.dto.UserDTO;
import com.railway.user_service.exception.FieldAlreadyExistException;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.*;

@Service
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }


    /**
     * Adds a new user to the system after checking for duplicate email or username.
     */
    @Override
    public UserDTO addUser(UserRequestDTO userRequestDTO) {
        Optional<User> existingUser = userRepository.findByEmail(userRequestDTO.getEmail());
        Optional<User> existingUsername = userRepository.findByUserName(userRequestDTO.getUserName());

        if (existingUsername.isPresent()) {
            throw new FieldAlreadyExistException("User with username " + userRequestDTO.getUserName() + " already exists!");
        }

        if (existingUser.isPresent()) {
            throw new FieldAlreadyExistException("User with email " + userRequestDTO.getEmail() + " already exists!");
        }

        User user = UserMapper.mapToEntity(userRequestDTO);

        user.setPassword(passwordEncoder.encode(user.getPassword()));

        User addedUser = userRepository.save(user);
        log.info("User with ID " + addedUser.getUserId() + " added successfully!");

        UserDTO userResponse = UserMapper.mapToDTO(addedUser);

        return userResponse;
    }


    /**
     * Retrieves a user by their ID.
     */
    @Override
    public UserDTO getUserById(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User with ID " + userId + " not found"));

        log.info("User with ID " + userId + " fetched successfully!");

        return UserMapper.mapToDTO(user);
    }


    /**
     * Retrieves all users in the system.
     */
    @Override
    public List<UserDTO> getAllUsers() {
        List<User> allUsers = userRepository.findAll();
        log.info("All Users fetched successfully!");

        List<UserDTO> allUsersDTO = allUsers.stream().map(UserMapper::mapToDTO).toList();

        return allUsersDTO;
    }


    /**
     * Retrieves a user by their email.
     */
    @Override
    public UserDTO getUserByEmail(String email) {
        Optional<User> user = userRepository.findByEmail(email);

        if (user.isEmpty()) {
            throw new IllegalArgumentException("User with email " + email + " does not exist!");
        }
        log.info("User with email " + email + " fetched successfully!");

        UserDTO userResponse = UserMapper.mapToDTO(user.get());

        return userResponse;
    }


    /**
     * Retrieves a user by their username.
     */
    @Override
    public UserDTO getUserByUserName(String userName) {
        Optional<User> user = userRepository.findByUserName(userName);

        if (user.isEmpty()) {
            throw new IllegalArgumentException("User with username " + userName + " does not exist!");
        }
        log.info("User with username " + userName + " fetched successfully!");

        UserDTO userResponse = UserMapper.mapToDTO(user.get());

        return userResponse;
    }


    /**
     * Deletes a user by their username.
     */
    @Override
    @Transactional
    public String deleteUserByUserName(String userName) {
        Optional<User> userOptional = userRepository.findByUserName(userName);

        if (userOptional.isEmpty()) {
            throw new IllegalArgumentException("User with username " + userName + " does not exist!");
        }

        userRepository.delete(userOptional.get());

        log.info("User {} deleted successfully!", userName);

        return "User with username " + userName + " has been deleted successfully!";
    }


    /**
     * Changes the password for a user after verifying the old password.
     */
    @Override
    @Transactional
    public String changePassword(String username, String oldPassword, String newPassword) {
        Optional<User> userOpt = userRepository.findByUserName(username);

        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found with username: " + username);
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new IllegalArgumentException("Old password is incorrect!");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", username);
        return "Password changed successfully for user: " + username;
    }

    @Override
    public long countAllUsers() {
        return userRepository.countAllUsers();
    }
}
