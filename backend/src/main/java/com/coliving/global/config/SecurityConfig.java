package com.coliving.global.config;

import com.coliving.global.security.JwtAuthenticationFilter;
import com.coliving.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // permitAll
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login",
                                "/api/auth/refresh", "/api/auth/find-id", "/api/auth/reset-password")
                        .permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/rooms/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/posts", "/api/posts/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/facilities").permitAll() // §6.1 🔓 Public
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                        // ADMIN only
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // RESIDENT or ADMIN
                        .requestMatchers("/api/devices/**", "/api/facilities/**",
                                "/api/reservations/**", "/api/control-logs/**")
                        .hasAnyRole("RESIDENT", "ADMIN")

                        // authenticated
                        .anyRequest().authenticated())
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
