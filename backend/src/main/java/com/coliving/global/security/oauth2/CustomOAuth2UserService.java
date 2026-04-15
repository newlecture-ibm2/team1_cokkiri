package com.coliving.global.security.oauth2;

import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import com.coliving.common.auth.application.port.out.AuthRepositoryPort;
import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final AuthRepositoryPort authRepositoryPort;
    private final PasswordEncoder passwordEncoder;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oAuth2User = delegate.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        String userNameAttributeName = userRequest.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        Map<String, Object> attributes = oAuth2User.getAttributes();
        log.info("OAuth2 인증 요청 - Provider: {}, Attributes: {}", registrationId, attributes);

        String providerId = extractProviderId(registrationId, attributes);
        String loginId = registrationId + "_" + providerId;
        String name = extractName(registrationId, attributes);
        String email = extractEmail(registrationId, attributes);

        boolean isNewUser = false;
        UserEntity userEntity;
        var optUser = authRepositoryPort.findByLoginId(loginId);
        
        if (optUser.isPresent()) {
            userEntity = optUser.get();
        } else {
            userEntity = createUser(loginId, name, email);
            isNewUser = true;
        }

        if (userEntity.getStatus() == UserStatus.DEACTIVATED) {
            userEntity.activate();
            authRepositoryPort.save(userEntity);
        }

        CustomOAuth2User customUser = new CustomOAuth2User(userEntity, attributes, userNameAttributeName);
        customUser.setNewUser(isNewUser);
        return customUser;
    }

    private String extractProviderId(String registrationId, Map<String, Object> attributes) {
        if ("naver".equals(registrationId)) {
            Map<String, Object> response = (Map<String, Object>) attributes.get("response");
            return (String) response.get("id");
        } else if ("kakao".equals(registrationId)) {
            return String.valueOf(attributes.get("id"));
        } else {
            return (String) attributes.get("sub");
        }
    }

    private String extractName(String registrationId, Map<String, Object> attributes) {
        if ("naver".equals(registrationId)) {
            Map<String, Object> response = (Map<String, Object>) attributes.get("response");
            return (String) response.get("name");
        } else if ("kakao".equals(registrationId)) {
            Map<String, Object> properties = (Map<String, Object>) attributes.get("properties");
            return properties != null ? (String) properties.get("nickname") : "KakaoUser";
        } else {
            return (String) attributes.get("name");
        }
    }

    private String extractEmail(String registrationId, Map<String, Object> attributes) {
        if ("naver".equals(registrationId)) {
            Map<String, Object> response = (Map<String, Object>) attributes.get("response");
            return (String) response.get("email");
        } else if ("kakao".equals(registrationId)) {
            Map<String, Object> kakaoAccount = (Map<String, Object>) attributes.get("kakao_account");
            return kakaoAccount != null ? (String) kakaoAccount.get("email") : null;
        } else {
            return (String) attributes.get("email");
        }
    }

    private UserEntity createUser(String loginId, String name, String email) {
        if (name == null || name.isBlank()) {
            name = "소셜유저";
        }
        UserEntity user = UserEntity.builder()
                .loginId(loginId)
                // Use a dummy random password hash simply to fulfill the DB constraint
                .passwordHash(passwordEncoder.encode(UUID.randomUUID().toString()))
                .name(name)
                .email(email)
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();
        authRepositoryPort.save(user);
        return user;
    }
}
