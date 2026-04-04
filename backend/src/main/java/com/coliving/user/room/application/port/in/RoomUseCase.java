package com.coliving.user.room.application.port.in;

import com.coliving.user.room.application.command.RoomListCommand;
import com.coliving.user.room.model.Room;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

public interface RoomUseCase {

    Page<Room> getRooms(RoomListCommand command, Pageable pageable);

    Optional<Room> getRoom(Long spaceId);
}
