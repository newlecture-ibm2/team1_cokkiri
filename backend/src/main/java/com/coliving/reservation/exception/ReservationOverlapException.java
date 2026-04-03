package com.coliving.reservation.exception;

import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;

/**
 * 예약 동시성 충돌 예외
 * 
 * 요청한 예약 시간이 이미 확정된 다른 예약과 겹칠 때 발생합니다.
 * 클라이언트에게 409 Conflict 응답을 반환합니다.
 */
public class ReservationOverlapException extends BusinessException {

    public ReservationOverlapException(String message) {
        super(ErrorCode.TIME_SLOT_CONFLICT, message);
    }
}
