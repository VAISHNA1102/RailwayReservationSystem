package com.railway.user_service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.railway.user_service.controller.UserController;
import com.railway.user_service.dto.UserDTO;
import com.railway.user_service.dto.UserRequestDTO;
import com.railway.user_service.service.UserService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;
import static org.mockito.ArgumentMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;


    /**
     * Tests user registration endpoint.
     */
    @Test
    void testAddUser() throws Exception {
        UserRequestDTO request = UserRequestDTO.builder()
                .userName("rahul123")
                .email("rahul@example.com")
                .password("Password@1")
                .build();

        UserDTO response = UserDTO.builder()
                .userId(1)
                .userName("rahul123")
                .email("rahul@example.com")
                .build();

        Mockito.when(userService.addUser(any(UserRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/users/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.userName").value("rahul123"));
    }


    /**
     * Tests fetching user by ID.
     */
    @Test
    void testGetUserById() throws Exception {
        UserDTO response = UserDTO.builder()
                .userId(1)
                .userName("rahul123")
                .email("rahul@example.com")
                .build();

        Mockito.when(userService.getUserById(1)).thenReturn(response);

        mockMvc.perform(get("/api/v1/users/getUserById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userName").value("rahul123"));
    }


    /**
     * Tests fetching all users.
     */
    @Test
    void testGetAllUsers() throws Exception {
        UserDTO user = UserDTO.builder()
                .userId(1)
                .userName("rahul123")
                .email("rahul@example.com")
                .build();

        Mockito.when(userService.getAllUsers()).thenReturn(List.of(user));

        mockMvc.perform(get("/api/v1/users/allUsers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userName").value("rahul123"));
    }


    /**
     * Tests fetching user by email.
     */
    @Test
    void testGetUserByEmail() throws Exception {
        UserDTO response = UserDTO.builder()
                .userId(1)
                .userName("rahul123")
                .email("rahul@example.com")
                .build();

        Mockito.when(userService.getUserByEmail("rahul@example.com")).thenReturn(response);

        mockMvc.perform(get("/api/v1/users/getUserByEmail")
                        .param("email", "rahul@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userName").value("rahul123"));
    }


    /**
     * Tests fetching user by username.
     */
    @Test
    void testGetUserByUserName() throws Exception {
        UserDTO response = UserDTO.builder()
                .userId(1)
                .userName("rahul123")
                .email("rahul@example.com")
                .build();

        Mockito.when(userService.getUserByUserName("rahul123")).thenReturn(response);

        mockMvc.perform(get("/api/v1/users/getUserByUserName")
                        .param("userName", "rahul123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userName").value("rahul123"));
    }


    /**
     * Tests deleting user by username.
     */
    @Test
    void testDeleteUserByUserName() throws Exception {
        String rawJsonString = "\"rahul123\"";
        String actualUserName = "rahul123";
        String expectedResponse = "User with username " + actualUserName + " has been deleted successfully!";


        Mockito.when(userService.deleteUserByUserName("\"rahul123\"")).thenReturn(expectedResponse);

        mockMvc.perform(delete("/api/v1/users/deleteUserByUserName")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(rawJsonString))
                .andExpect(status().isOk())
                .andExpect(content().string(expectedResponse));
    }


    /**
     * Tests changing password for a user.
     */
    @Test
    void testChangePassword() throws Exception {
        Mockito.when(userService.changePassword("rahul123", "Password@1", "NewPass@123"))
                .thenReturn("Password changed successfully for user: rahul123");

        mockMvc.perform(put("/api/v1/users/rahul123/change-password")
                        .param("oldPassword", "Password@1")
                        .param("newPassword", "NewPass@123"))
                .andExpect(status().isOk())
                .andExpect(content().string("Password changed successfully for user: rahul123"));
    }


    /**
     * Tests counting total users.
     */
    @Test
    void testCountAllUsers() throws Exception {
        Mockito.when(userService.countAllUsers()).thenReturn(5L);

        mockMvc.perform(get("/api/v1/users/count"))
                .andExpect(status().isOk())
                .andExpect(content().string("5"));
    }
}