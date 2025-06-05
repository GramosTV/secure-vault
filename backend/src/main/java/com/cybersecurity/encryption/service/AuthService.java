package com.cybersecurity.encryption.service;

import com.cybersecurity.encryption.dto.*;
import com.cybersecurity.encryption.entity.User;
import com.cybersecurity.encryption.repository.UserRepository;
import com.cybersecurity.encryption.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    @Autowired
    private AuthenticationManager authenticationManager;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder encoder;
    @Autowired
    private JwtTokenProvider jwtUtils;

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateToken(authentication);
        String refreshToken = jwtUtils.generateRefreshToken(authentication);
        User user = (User) authentication.getPrincipal();
        UserResponse userResponse = new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getCreatedAt());
        AuthResponse response = new AuthResponse();
        response.setAccessToken(jwt);
        response.setRefreshToken(refreshToken);
        response.setTokenType("Bearer");
        response.setUser(userResponse);
        return response;
    }

    public MessageResponse registerUser(RegisterRequest signUpRequest) {
        if (userRepository.existsByUsername(signUpRequest.getUsername())) {
            return new MessageResponse("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return new MessageResponse("Error: Email is already in use!");
        }
        User user = new User();
        user.setUsername(signUpRequest.getUsername());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        userRepository.save(user);
        return new MessageResponse("User registered successfully!");
    }

    public TokenRefreshResponse refreshToken(String refreshToken) {
        if (jwtUtils.validateToken(refreshToken)) {
            String username = jwtUtils.getUsernameFromToken(refreshToken);
            String newToken = jwtUtils.generateTokenFromUsername(username, jwtUtils.getJwtExpirationMs());
            TokenRefreshResponse response = new TokenRefreshResponse();
            response.setAccessToken(newToken);
            response.setRefreshToken(refreshToken);
            response.setTokenType("Bearer");
            return response;
        } else {
            throw new RuntimeException("Refresh token is not valid!");
        }
    }
}
