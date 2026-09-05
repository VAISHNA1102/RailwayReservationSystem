package com.railway.api_gateway.service;

import com.railway.api_gateway.dto.UserClientDTO;
import com.railway.api_gateway.feign.UserClient;
import com.railway.api_gateway.jwt.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserClient userClient;


    public String authenticate(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));
        if (authentication.isAuthenticated()) {
//            return jwtService.generateToken(email);

            UserClientDTO user = userClient.getUserByEmail(email).getBody(); // fetch user info
            return jwtService.generateToken(user);
        }
        return null;
    }

}
