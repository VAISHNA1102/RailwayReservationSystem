package com.railway.user_service.controller;

import com.railway.user_service.dto.UserDTO;
import com.railway.user_service.dto.UserRequestDTO;
import com.railway.user_service.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Registers a new user.
     */
    @PostMapping("/register")
    public ResponseEntity<UserDTO> addUser(@Valid @RequestBody UserRequestDTO userRequestDTO) {
        UserDTO response = userService.addUser(userRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }


    /**
     * Retrieves a user by their ID.
     */
    @GetMapping("/getUserById/{userId}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Integer userId) {
        UserDTO response = userService.getUserById(userId);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


    /**
     * Retrieves all users.
     */
    @GetMapping("/allUsers")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> allUsersList = userService.getAllUsers();
        return ResponseEntity.status(HttpStatus.OK).body(allUsersList);
    }


    /**
     * Retrieves a user by their email.
     */
    @GetMapping("/getUserByEmail")
    public ResponseEntity<UserDTO> getUserByEmail(@RequestParam String email) {
        UserDTO response = userService.getUserByEmail(email);
        return ResponseEntity.ok(response);
    }


    /**
     * Retrieves a user by their username.
     */
    @GetMapping("/getUserByUserName")
    public ResponseEntity<UserDTO> getUserByUserName(@RequestParam String userName) {
        UserDTO response = userService.getUserByUserName(userName);
        return ResponseEntity.ok(response);
    }


    /**
     * Deletes a user by their username.
     */
    @DeleteMapping("/deleteUserByUserName")
    public ResponseEntity<String> deleteUserByUserName(@RequestBody String userName) {
        String response = userService.deleteUserByUserName(userName);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }


    /**
     * Changes the password for a user.
     */
    @PutMapping("/{username}/change-password")
    public ResponseEntity<String> changePassword(
            @PathVariable String username,
            @RequestParam String oldPassword,
            @RequestParam String newPassword) {
        String response = userService.changePassword(username, oldPassword, newPassword);
        return ResponseEntity.ok(response);
    }


    /**
     * Returns the total number of users.
     */
    @GetMapping("/count")
    public ResponseEntity<Long> countAllUsers() {
        long count = userService.countAllUsers();
        return ResponseEntity.status(HttpStatus.OK).body(count);
    }

}
