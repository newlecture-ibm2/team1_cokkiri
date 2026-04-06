package com.coliving.user.room.application.port.out;

import com.coliving.user.room.model.Room;
import com.coliving.user.room.model.RoomType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * 유저 방 조회용 Repository Port
 */
public interface RoomRepositoryPort {

    Page<Room> findAvailablePrivateSpaces(Pageable pageable);

    Page<Room> findAvailableRoomsWithFilter(RoomType roomType, BigDecimal minRent,
                                             BigDecimal maxRent, Integer floor, Pageable pageable);

    Optional<Room> findById(Long spaceId);
}

