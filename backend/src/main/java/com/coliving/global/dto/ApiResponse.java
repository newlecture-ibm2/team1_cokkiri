package com.coliving.global.dto;

import com.coliving.global.error.ErrorCode;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private boolean success;
    private T data;
    private String message;
    private String errorCode;

    public static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> ok(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .build();
    }

    public static ApiResponse<?> error(ErrorCode code) {
        return ApiResponse.builder()
                .success(false)
                .message(code.getMessage())
                .errorCode(code.name())
                .build();
    }

    public static ApiResponse<?> error(ErrorCode code, String message) {
        return ApiResponse.builder()
                .success(false)
                .message(message)
                .errorCode(code.name())
                .build();
    }
}
