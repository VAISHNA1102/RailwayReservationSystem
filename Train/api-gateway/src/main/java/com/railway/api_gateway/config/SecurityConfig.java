package com.railway.api_gateway.config;

import com.railway.api_gateway.feign.UserClient;
import com.railway.api_gateway.jwt.JwtFilter;
import com.railway.api_gateway.service.FeignAuthenticationProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtFilter jwtFilter;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.csrf(AbstractHttpConfigurer::disable);

        httpSecurity.cors(Customizer.withDefaults()).authorizeHttpRequests(authorizeRequests -> authorizeRequests

//                ======================== User Service ===========================

                //public routes
//                .requestMatchers(HttpMethod.POST, "/api/v1/users/register", "/api/v1/auth/login").permitAll()

                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/users/register", "/api/v1/auth/login").permitAll()



        // USER-level endpoints
                //   .requestMatchers("/api/v1/users/*/update-address").hasRole("USER")
                .requestMatchers("/api/v1/users/*/change-password").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")

                // ADMIN-only endpoints
                .requestMatchers(HttpMethod.GET, "/api/v1/users/getUserById/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/users/getUserByEmail").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/users/getUserByUserName").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/users/allUsers").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/users/deleteUserByUserName").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/users/count").hasAuthority("ROLE_ADMIN")


//                ======================== Train Service ===========================

                // Train-service routes (USER & ADMIN)
                .requestMatchers(HttpMethod.GET,
                        "/api/v1/trains/getTrainById/**",
                        "/api/v1/trains/allTrains",
                        "/api/v1/trains/search",
                        "/api/v1/trains/getAllTrainsByName").permitAll()

                .requestMatchers(HttpMethod.POST,
                        "/api/v1/trains/getTrainByNumber").permitAll()

                // Reduce seats endpoint — make it public for booking flow
                .requestMatchers(HttpMethod.PUT, "/api/v1/trains/reduceSeats").permitAll()

                // ADMIN-only train-service routes
                .requestMatchers(HttpMethod.POST, "/api/v1/trains/addTrain").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/trains/updateTrain/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/trains/deleteTrainByNumber").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET,
                        "/api/v1/trains/getClassById/**",
                        "/api/v1/trains/getTrainClassByTrainIdAndClassType/**","/api/v1/trains/count").hasAuthority("ROLE_ADMIN")



//                ======================== Reservation Service ===========================

                .requestMatchers(HttpMethod.POST, "/api/v1/reservations/addReservation").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/reservations/getReservationByPNR/{pnr}").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/reservations/user/{username}").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/reservations/count").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/reservations/count/confirmed").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/reservations/count/cancelled").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/reservations/cancel/**").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/reservations/cancellable/**").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/reservations/updateStatus/{pnr}").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/reservations/allReservations").hasAuthority("ROLE_ADMIN")




//                ======================== Payment Service ===========================

                .requestMatchers(HttpMethod.POST, "/api/v1/payments/initiate/{pnr}").hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/payments/success").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/payments/allPayments").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/payments/count").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/payments/count/successful").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/payments/count/refunded").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/payments/revenue").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/v1/payments/refund/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/v1/payments/fix-cancelled-payments").hasAuthority("ROLE_ADMIN")


                .anyRequest().authenticated());

        httpSecurity.httpBasic(Customizer.withDefaults());
        httpSecurity.sessionManagement(sessionManagement -> sessionManagement.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        httpSecurity.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return httpSecurity.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(UserClient userClient, BCryptPasswordEncoder passwordEncoder) {
        return new FeignAuthenticationProvider(userClient, passwordEncoder);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}
