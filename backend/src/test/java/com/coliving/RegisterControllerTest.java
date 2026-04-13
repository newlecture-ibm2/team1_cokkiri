package com.coliving;

import com.coliving.common.auth.adapter.in.web.AuthController;
import com.coliving.common.auth.adapter.in.web.dto.req.RegisterRequestDto;
import com.coliving.common.auth.application.port.in.RegisterUseCase;
import com.coliving.global.error.GlobalExceptionHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

public class RegisterControllerTest {

    private MockMvc mockMvc;

    @BeforeEach
    public void setup() {
        RegisterUseCase registerUseCase = Mockito.mock(RegisterUseCase.class);
        mockMvc = MockMvcBuilders.standaloneSetup(new AuthController(registerUseCase, null, null, null))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    public void testRegisterMapping() throws Exception {
        String jsonPayload = "{\"loginId\":\"byeolsitest2\", \"password\":\"Valid@Password1\", " +
                "\"passwordConfirm\":\"Valid@Password1\", \"name\":\"byeolsi\", \"birthDate\":\"970516\", " +
                "\"gender\":\"MALE\", \"nationality\":\"대한민국\", \"phone\":\"010-2440-5277\", " +
                "\"email\":\"byeo2@gmail.com\", \"privacyConsent\":true, \"termsConsent\":true}";

        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andDo(print());
    }
}
