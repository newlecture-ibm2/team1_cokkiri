package com.coliving.user.room.application.port.out;

import com.coliving.user.room.model.Room;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * 유저 방 조회용 Repository Port
 */
public interface RoomRepositoryPort {

    Page<Room> findAvailablePrivateSpaces(Pageable pageable);

    Optional<Room> findById(Long spaceId);
}
