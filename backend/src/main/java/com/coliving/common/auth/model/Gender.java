package com.coliving.common.auth.model;

import com.fasterxml.jackson.annotation.JsonCreator;

/**
 * 성별
 */
public enum Gender {
    MALE,
    FEMALE;

    @JsonCreator
    public static Gender from(String value) {
        for (Gender gender : Gender.values()) {
            if (gender.name().equalsIgnoreCase(value)) {
                return gender;
            }
        }
        return null;
    }
}
