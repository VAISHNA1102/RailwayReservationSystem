package com.railway.user_service;

import com.railway.user_service.dto.UserDTO;
import com.railway.user_service.dto.UserRequestDTO;
import com.railway.user_service.entity.Role;
import com.railway.user_service.entity.User;
import com.railway.user_service.exception.FieldAlreadyExistException;
import com.railway.user_service.repository.UserRepository;
import com.railway.user_service.service.UserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private User user;
    private UserRequestDTO userRequestDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        userRequestDTO = UserRequestDTO.builder()
                .userName("rahul123")
                .email("rahul@example.com")
                .password("Password@1")
                .build();

        user = User.builder()
                .userId(1)
                .userName("rahul123")
                .email("rahul@example.com")
                .password("encodedPassword")
                .role(Role.USER)
                .build();
    }


    /**
     * Tests successful user registration.
     */
    @Test
    void testAddUser_Success() {
        when(userRepository.findByEmail(userRequestDTO.getEmail())).thenReturn(Optional.empty());
        when(userRepository.findByUserName(userRequestDTO.getUserName())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(userRequestDTO.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(user);

        UserDTO result = userService.addUser(userRequestDTO);

        assertNotNull(result);
        assertEquals("rahul123", result.getUserName());
        verify(userRepository).save(any(User.class));
    }


    /**
     * Tests registration failure when username already exists.
     */
    @Test
    void testAddUser_UsernameExists() {
        when(userRepository.findByUserName(userRequestDTO.getUserName()))
                .thenReturn(Optional.of(user));

        assertThrows(FieldAlreadyExistException.class, () -> userService.addUser(userRequestDTO));
    }


    /**
     * Tests registration failure when email already exists.
     */
    @Test
    void testAddUser_EmailExists() {
        when(userRepository.findByUserName(userRequestDTO.getUserName())).thenReturn(Optional.empty());
        when(userRepository.findByEmail(userRequestDTO.getEmail())).thenReturn(Optional.of(user));

        assertThrows(FieldAlreadyExistException.class, () -> userService.addUser(userRequestDTO));
    }


    /**
     * Tests successful retrieval of user by ID.
     */
    @Test
    void testGetUserById_Success() {
        when(userRepository.findById(1)).thenReturn(Optional.of(user));

        UserDTO result = userService.getUserById(1);

        assertEquals("rahul123", result.getUserName());
    }


    /**
     * Tests failure when user ID is not found.
     */
    @Test
    void testGetUserById_NotFound() {
        when(userRepository.findById(2)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> userService.getUserById(2));
    }


    /**
     * Tests retrieval of all users.
     */
    @Test
    void testGetAllUsers() {
        when(userRepository.findAll()).thenReturn(List.of(user));

        List<UserDTO> result = userService.getAllUsers();

        assertEquals(1, result.size());
        assertEquals("rahul123", result.get(0).getUserName());
    }


    /**
     * Tests successful retrieval of user by email.
     */
    @Test
    void testGetUserByEmail_Success() {
        when(userRepository.findByEmail("rahul@example.com")).thenReturn(Optional.of(user));

        UserDTO result = userService.getUserByEmail("rahul@example.com");

        assertEquals("rahul123", result.getUserName());
    }


    /**
     * Tests failure when email is not found.
     */
    @Test
    void testGetUserByEmail_NotFound() {
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> userService.getUserByEmail("notfound@example.com"));
    }


    /**
     * Tests successful retrieval of user by username.
     */
    @Test
    void testGetUserByUserName_Success() {
        when(userRepository.findByUserName("rahul123")).thenReturn(Optional.of(user));

        UserDTO result = userService.getUserByUserName("rahul123");

        assertEquals("rahul123", result.getUserName());
    }


    /**
     * Tests failure when username is not found.
     */
    @Test
    void testGetUserByUserName_NotFound() {
        when(userRepository.findByUserName("unknown")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> userService.getUserByUserName("unknown"));
    }


    /**
     * Tests successful deletion of user by username.
     */
    @Test
    void testDeleteUserByUserName_Success() {
        when(userRepository.findByUserName("rahul123")).thenReturn(Optional.of(user));

        String result = userService.deleteUserByUserName("rahul123");

        assertEquals("User with username rahul123 has been deleted successfully!", result);
        verify(userRepository).delete(user);
    }


    /**
     * Tests failure when trying to delete a non-existent user.
     */
    @Test
    void testDeleteUserByUserName_NotFound() {
        when(userRepository.findByUserName("unknown")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> userService.deleteUserByUserName("unknown"));
    }


    /**
     * Tests successful password change.
     */
    @Test
    void testChangePassword_Success() {
        when(userRepository.findByUserName("rahul123")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password@1", "encodedPassword")).thenReturn(true);
        when(passwordEncoder.encode("NewPass@123")).thenReturn("newEncodedPassword");

        String result = userService.changePassword("rahul123", "Password@1", "NewPass@123");

        assertEquals("Password changed successfully for user: rahul123", result);
    }


    /**
     * Tests failure when user is not found during password change.
     */
     @Test
    void testChangePassword_UserNotFound() {
        when(userRepository.findByUserName("unknown")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> userService.changePassword("unknown", "old", "new"));
    }


    /**
     * Tests failure when old password is incorrect.
     */
    @Test
    void testChangePassword_InvalidOldPassword() {
        when(userRepository.findByUserName("rahul123")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongOld", "encodedPassword")).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> userService.changePassword("rahul123", "wrongOld", "new"));
    }


    /**
     * Tests counting total users.
     */
    @Test
    void testCountAllUsers() {
        when(userRepository.countAllUsers()).thenReturn(5L);

        long count = userService.countAllUsers();

        assertEquals(5L, count);
    }
}