package com.coliving.global.security.oauth2;

import com.coliving.common.auth.adapter.out.jpa.UserEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

public class CustomOAuth2User implements OAuth2User {

    private final UserEntity userEntity;
    private final Map<String, Object> attributes;
    private final String nameAttributeKey;
    private boolean isNewUser = false;

    public CustomOAuth2User(UserEntity userEntity, Map<String, Object> attributes, String nameAttributeKey) {
        this.userEntity = userEntity;
        this.attributes = attributes;
        this.nameAttributeKey = nameAttributeKey;
    }

    public boolean isNewUser() {
        return isNewUser;
    }

    public void setNewUser(boolean isNewUser) {
        this.isNewUser = isNewUser;
    }

    public UserEntity getUserEntity() {
        return userEntity;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + userEntity.getRole().name()));
    }

    @Override
    public String getName() {
        return String.valueOf(attributes.get(nameAttributeKey));
    }
}
