package com.coliving;

import com.coliving.common.auth.application.command.RegisterCommand;
import com.coliving.common.auth.application.port.in.RegisterUseCase;
import com.coliving.common.auth.model.Gender;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@org.springframework.test.context.ActiveProfiles("dev")
public class TempIntegrationTest {

    @Autowired
    private RegisterUseCase registerUseCase;

    @Test
    public void testRegister() {
        try {
            RegisterCommand cmd = RegisterCommand.builder()
                .loginId("test500error")
                .password("Valid@Password1")
                .passwordConfirm("Valid@Password1")
                .name("test")
                .birthDate("990101")
                .gender(Gender.MALE)
                .nationality("대한민국")
                .phone("010-1234-5678")
                .email("test@email.com")
                .build();
            registerUseCase.register(cmd);
            System.out.println("SUCCESS");
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }
}
