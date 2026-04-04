package com.coliving.global.error;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {

    // ── 인증 및 회원 ──
    INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "아이디 또는 비밀번호를 확인하세요"),
    ACCOUNT_DEACTIVATED(HttpStatus.UNAUTHORIZED, "탈퇴한 계정입니다"),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "현재 비밀번호가 일치하지 않습니다"),
    TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "토큰이 만료되었습니다"),
    FORBIDDEN(HttpStatus.FORBIDDEN, "접근 권한이 없습니다"),
    SAME_PASSWORD(HttpStatus.BAD_REQUEST, "현재와 동일한 비밀번호입니다"),
    ACTIVE_CONTRACT_EXISTS(HttpStatus.CONFLICT, "활성 계약이 존재하여 진행할 수 없습니다"),
    UNPAID_PAYMENT_EXISTS(HttpStatus.CONFLICT, "미납금이 존재하여 진행할 수 없습니다"),
    DUPLICATE_LOGIN_ID(HttpStatus.CONFLICT, "이미 사용 중인 로그인 ID입니다"),

    // ── 계정 찾기 ──
    ACCOUNT_NOT_FOUND(HttpStatus.NOT_FOUND, "일치하는 계정 없음"),
    EMAIL_SEND_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "이메일 발송 실패"),
    TOO_MANY_REQUESTS(HttpStatus.TOO_MANY_REQUESTS, "요청 횟수 초과"),

    // ── 계약 및 예약 ──
    SPACE_NOT_AVAILABLE(HttpStatus.CONFLICT, "해당 호실은 현재 계약/예약이 불가합니다"),
    APPLICATION_EXISTS(HttpStatus.CONFLICT, "이미 진행 중인 신청이 있습니다"),
    NO_ACTIVE_CONTRACT(HttpStatus.CONFLICT, "유효한 활성 계약이 없습니다"),
    TIME_SLOT_CONFLICT(HttpStatus.CONFLICT, "해당 시간대는 이미 예약되었습니다"),
    INVALID_STATUS(HttpStatus.CONFLICT, "현재 상태에서 수행할 수 없는 작업입니다"),

    // ── 기기 제어 ──
    DEVICE_OFFLINE(HttpStatus.UNPROCESSABLE_ENTITY, "기기가 오프라인 상태입니다"),
    DEVICE_INACTIVE(HttpStatus.UNPROCESSABLE_ENTITY, "기기가 비활성화 상태입니다"),
    SPACE_MISMATCH(HttpStatus.FORBIDDEN, "해당 기기에 대한 접근 권한이 없습니다"),
    NO_ACTIVE_RESERVATION(HttpStatus.FORBIDDEN, "유효한 예약이 없어 공용 기기를 제어할 수 없습니다"),
    CCTV_ADMIN_ONLY(HttpStatus.FORBIDDEN, "CCTV는 관리자만 제어할 수 있습니다"),
    IOT_COMMUNICATION_FAIL(HttpStatus.BAD_GATEWAY, "IoT 기기 동기화 통신에 실패했습니다"),
    CONTROL_LOG_EXISTS(HttpStatus.CONFLICT, "제어 이력이 존재하여 삭제할 수 없습니다"),
    DEVICE_ACTIVE(HttpStatus.CONFLICT, "활성화 상태의 기기는 삭제할 수 없습니다"),

    // ── 공통 ──
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "필수 항목 누락 또는 형식이 올바르지 않습니다"),
    NOT_FOUND(HttpStatus.NOT_FOUND, "요청하신 리소스를 찾을 수 없습니다"),
    
    // ── 공간 (Space) ──
    SPACE_NOT_FOUND(HttpStatus.NOT_FOUND, "요청하신 공간을 찾을 수 없습니다"),
    DUPLICATE_SPACE_NAME(HttpStatus.CONFLICT, "이미 사용 중인 공간 이름입니다"),
    OCCUPIED_SPACE_MODIFICATION(HttpStatus.CONFLICT, "입주 중이거나 사용 중인 공간은 구조를 변경할 수 없습니다"),
    FILE_SIZE_EXCEEDED(HttpStatus.PAYLOAD_TOO_LARGE, "파일 업로드 용량을 초과했습니다"),
    SPACE_IMAGE_NOT_FOUND(HttpStatus.NOT_FOUND, "공간 이미지를 찾을 수 없습니다");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}
