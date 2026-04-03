package com.coliving.common.auth.model;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * 사용자 역할
 * USER     : 일반 회원 (비입주 상태)
 * RESIDENT : 입주자 (활성 계약 보유)
 * ADMIN    : 관리자
 */
public enum UserRole {
    USER,
    RESIDENT,
    ADMIN;

    @JsonCreator
    public static UserRole from(String value) {
        for (UserRole role : UserRole.values()) {
            if (role.name().equalsIgnoreCase(value)) {
                return role;
            }
        }
        return null;
    }
}
