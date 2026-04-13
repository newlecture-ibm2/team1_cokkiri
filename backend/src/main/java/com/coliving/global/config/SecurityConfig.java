package com.coliving.global.config;

import com.coliving.global.security.JwtAuthenticationFilter;
import com.coliving.global.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import jakarta.servlet.DispatcherType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.Customizer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtTokenProvider jwtTokenProvider;
    private final com.coliving.common.auth.application.port.out.AuthRepositoryPort authRepositoryPort;

    /** 일반 회원·입주자·관리자 공통 (JWT role 클레임과 동일) */
    private static final String[] MEMBER_ROLES = {"USER", "RESIDENT", "ADMIN"};

    /** 입주자·관리자만 (게시판·민원·댓글 CUD) */
    private static final String[] RESIDENT_ADMIN_ROLES = {"RESIDENT", "ADMIN"};

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
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // --- 에러 디스패치: 보안 필터 우회 (500 변환 방지) ---
                        .dispatcherTypeMatchers(DispatcherType.ERROR, DispatcherType.FORWARD).permitAll()
                        .requestMatchers("/error").permitAll()

                        // --- 공개: 인증 API ---
                        .requestMatchers(HttpMethod.POST, "/api/auth/register", "/api/auth/login",
                                "/api/auth/refresh", "/api/auth/find-id", "/api/auth/reset-password")
                        .permitAll()

                        // --- 공개: 공간·룸 조회 ---
                        .requestMatchers(HttpMethod.GET, "/api/rooms/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/experience/**").permitAll() // EXPERIENCE 공용시설 소개 🔓 Public
                        .requestMatchers(HttpMethod.GET, "/api/floors").permitAll() // FLOOR 층별 평면도 🔓 Public

                        // --- 커뮤니티: 목록·상세만 비로그인 조회 (Controller에서 Optional Actor 처리) ---
                        .requestMatchers(HttpMethod.GET, "/api/posts", "/api/posts/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/facilities").permitAll() // §6.1 🔓 Public
                        // 게시글 본문(리치 텍스트)에 포함된 업로드 이미지 조회
                        .requestMatchers(HttpMethod.GET, "/api/files/community/**").permitAll()

                        // --- 업로드 파일 정적 서빙 (배경 도면 등) ---
                        .requestMatchers(HttpMethod.GET, "/api/uploads/**").permitAll()

                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()

                        // --- 관리자 전용 ---
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // --- 입주자·관리자: IoT·시설·예약 등 ---
                        .requestMatchers("/api/devices/**", "/api/facilities/**",
                                "/api/reservations/**", "/api/control-logs/**")
                        .hasAnyRole("RESIDENT", "ADMIN")

                        // --- VOC: 입주자·관리자 전용 ---
                        .requestMatchers("/api/vocs/**").hasAnyRole(RESIDENT_ADMIN_ROLES)
                        // VOC 본문 이미지·첨부 파일
                        .requestMatchers(HttpMethod.GET, "/api/files/voc/**").hasAnyRole(RESIDENT_ADMIN_ROLES)

                        // --- 알림: 로그인 회원 전체 (USER 포함) ---
                        .requestMatchers("/api/notifications/**").hasAnyRole(MEMBER_ROLES)

                        // --- 댓글: 입주자·관리자만 ---
                        .requestMatchers("/api/comments/**").hasAnyRole(RESIDENT_ADMIN_ROLES)

                        // --- 커뮤니티: 글 작성·수정·삭제, 좋아요, 에디터 이미지 업로드 (GET은 위에서 이미 permitAll) ---
                        .requestMatchers("/api/posts/**").hasAnyRole(RESIDENT_ADMIN_ROLES)

                        // --- 그 외 API ---
                        .anyRequest().authenticated())
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(401);
                            response.getWriter().write("{\"success\":false,\"message\":\"로그인이 필요하거나 토큰이 만료되었습니다.\",\"errorCode\":\"UNAUTHORIZED\"}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(403);
                            response.getWriter().write("{\"success\":false,\"message\":\"접근 권한이 없습니다.\",\"errorCode\":\"FORBIDDEN\"}");
                        })
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider, authRepositoryPort),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
