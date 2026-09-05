package com.railway.api_gateway.controller;

import com.railway.api_gateway.dto.LoginRequestDTO;
import com.railway.api_gateway.dto.ResponseDTO;
import com.railway.api_gateway.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
public class    AuthController {
    private final AuthService authService;

    /**
     * Authenticates a user using email and password.
     */
    @PostMapping("/login")
    public ResponseEntity<ResponseDTO<String>> login(@Valid @RequestBody LoginRequestDTO loginRequestDTO) {
        String token = authService.authenticate(loginRequestDTO.getEmail(), loginRequestDTO.getPassword());
        ResponseDTO<String> responseDTO = new ResponseDTO<>(
                LocalDateTime.now(),
                true,
                "Login successful",
                token
        );
        return new ResponseEntity<>(responseDTO, HttpStatus.OK);
    }
}
