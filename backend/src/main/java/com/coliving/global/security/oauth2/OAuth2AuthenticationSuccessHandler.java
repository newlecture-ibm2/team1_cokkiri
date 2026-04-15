package com.coliving.global.security.oauth2;

import com.coliving.common.auth.adapter.out.jpa.RefreshTokenEntity;
import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.application.port.out.AuthRepositoryPort;
import com.coliving.common.auth.model.UserRole;
import com.coliving.global.security.JwtTokenProvider;
import com.coliving.user.contract.adapter.out.jpa.ContractEntity;
import com.coliving.user.contract.adapter.out.jpa.ContractJpaRepository;
import com.coliving.user.contract.model.ContractStatus;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final AuthRepositoryPort authRepositoryPort;
    private final ContractJpaRepository contractJpaRepository;

    @Value("${oauth2.success-url:http://localhost:3111/login/oauth2-success}")
    private String defaultSuccessUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        CustomOAuth2User oAuth2User = (CustomOAuth2User) authentication.getPrincipal();
        UserEntity user = oAuth2User.getUserEntity();

        Long contractId = null;
        Long spaceId = null;

        if (user.getRole() == UserRole.RESIDENT) {
            List<ContractEntity> contracts = contractJpaRepository.findByUserIdAndStatus(user.getUserId(), ContractStatus.ACTIVE);
            if (!contracts.isEmpty()) {
                ContractEntity activeContract = contracts.get(0);
                contractId = activeContract.getContractId();
                if (activeContract.getSpaceId() != null) {
                    spaceId = activeContract.getSpaceId();
                }
            } else {
                user.changeRole(UserRole.USER);
                authRepositoryPort.save(user);
            }
        }

        String accessToken = jwtTokenProvider.createAccessToken(user.getUserId(), user.getRole().name(), contractId, spaceId);
        String refreshToken = jwtTokenProvider.createRefreshToken(user.getUserId());

        authRepositoryPort.revokeAllRefreshTokensByUserId(user.getUserId());

        OffsetDateTime expiresAt = OffsetDateTime.now().plus(jwtTokenProvider.getRefreshExpiration(), ChronoUnit.MILLIS);
        RefreshTokenEntity refreshTokenEntity = RefreshTokenEntity.builder()
                .user(user)
                .token(refreshToken)
                .expiresAt(expiresAt)
                .isRevoked(false)
                .build();
        authRepositoryPort.saveRefreshToken(refreshTokenEntity);

        boolean isNewUser = oAuth2User.isNewUser();

        String redirectUrl = String.format("%s?accessToken=%s&refreshToken=%s&isNewUser=%b", defaultSuccessUrl, accessToken, refreshToken, isNewUser);
        response.sendRedirect(redirectUrl);
    }
}
