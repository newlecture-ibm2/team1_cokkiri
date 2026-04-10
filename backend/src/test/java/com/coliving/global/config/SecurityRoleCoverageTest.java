package com.coliving.global.config;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultMatcher;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
class SecurityRoleCoverageTest {

    @Autowired
    private MockMvc mockMvc;

    // 편의를 위한 Custom Matcher: 인증/인가 성공을 나타내는 상태 (2xx, 400, 404, 405 등 401/403이 아닌 상태)
    private ResultMatcher isAllowed() {
        return result -> {
            int status = result.getResponse().getStatus();
            if (status == 401 || status == 403) {
                throw new AssertionError("기대 상태: 허용(2xx, 404 등), 실제 상태: " + status);
            }
        };
    }

    @Test
    @DisplayName("Public API - 권한과 무관하게 접근 허용")
    void testPublicApi() throws Exception {
        // 공개 공간 조회 -> 허용 확인
        mockMvc.perform(get("/api/rooms/mock_not_exists"))
                .andExpect(isAllowed());
        // 로그인 API
        mockMvc.perform(post("/api/auth/login"))
                .andExpect(isAllowed());
    }

    @Test
    @DisplayName("Admin API - 권한별 접근 테스트 (ADMIN만 허용)")
    void testAdminApiUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/admin/mock_not_exists"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void testAdminApiUser() throws Exception {
        mockMvc.perform(get("/api/admin/mock_not_exists"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "RESIDENT")
    void testAdminApiResident() throws Exception {
        mockMvc.perform(get("/api/admin/mock_not_exists"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testAdminApiAdmin() throws Exception {
        mockMvc.perform(get("/api/admin/mock_not_exists"))
                .andExpect(isAllowed());
    }

    @Test
    @DisplayName("Device API - 권한별 접근 테스트 (RESIDENT, ADMIN 허용)")
    void testDeviceApiUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/devices/mock_not_exists"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void testDeviceApiUser() throws Exception {
        mockMvc.perform(get("/api/devices/mock_not_exists"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "RESIDENT")
    void testDeviceApiResident() throws Exception {
        mockMvc.perform(get("/api/devices/mock_not_exists"))
                .andExpect(isAllowed());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeviceApiAdmin() throws Exception {
        mockMvc.perform(get("/api/devices/mock_not_exists"))
                .andExpect(isAllowed());
    }

    @Test
    @DisplayName("VOC API - 권한별 접근 테스트 (MEMBER_ROLES 허용)")
    void testVocApiUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/vocs/mock_not_exists"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void testVocApiUser() throws Exception {
        mockMvc.perform(get("/api/vocs/mock_not_exists"))
                .andExpect(isAllowed());
    }

    @Test
    @WithMockUser(roles = "RESIDENT")
    void testVocApiResident() throws Exception {
        mockMvc.perform(get("/api/vocs/mock_not_exists"))
                .andExpect(isAllowed());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testVocApiAdmin() throws Exception {
        mockMvc.perform(get("/api/vocs/mock_not_exists"))
                .andExpect(isAllowed());
    }

    @Test
    @DisplayName("알림 API - 권한별 접근 테스트 (MEMBER_ROLES 허용)")
    @WithMockUser(roles = "USER")
    void testNotificationApiUser() throws Exception {
        mockMvc.perform(get("/api/notifications/mock_not_exists"))
                .andExpect(isAllowed());
    }

    @Test
    @DisplayName("방어 지점 테스트 - 존재하지 않는 그 외 API는 모두 인증 필터 작용")
    void testAnyRequestUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/unknown"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void testAnyRequestAuthenticated() throws Exception {
        mockMvc.perform(get("/api/unknown"))
                .andExpect(isAllowed());
    }
}
