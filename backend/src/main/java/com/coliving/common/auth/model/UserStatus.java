package com.coliving.common.auth.model;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * 계정 상태
 * ACTIVE      : 정상 활성 상태
 * DEACTIVATED : 비활성화 (탈퇴 또는 관리자 조치)
 */
public enum UserStatus {
    ACTIVE,
    DEACTIVATED;

    @JsonCreator
    public static UserStatus from(String value) {
        for (UserStatus status : UserStatus.values()) {
            if (status.name().equalsIgnoreCase(value)) {
                return status;
            }
        }
        return null;
    }
}
