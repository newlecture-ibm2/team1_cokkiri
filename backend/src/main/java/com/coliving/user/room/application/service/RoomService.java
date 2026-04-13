package com.coliving.user.room.application.service;

import com.coliving.user.room.application.command.RoomListCommand;
import com.coliving.user.room.application.port.in.RoomUseCase;
import com.coliving.user.room.application.port.out.RoomRepositoryPort;
import com.coliving.user.room.model.Room;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomService implements RoomUseCase {

    private final RoomRepositoryPort roomRepositoryPort;

    @Override
    public Page<Room> getRooms(RoomListCommand command, Pageable pageable) {
        boolean hasFilter = command.getKeyword() != null
                || command.getRoomTypeId() != null
                || command.getMinRent() != null
                || command.getMaxRent() != null
                || command.getFloor() != null;

        if (hasFilter) {
            return roomRepositoryPort.findAvailableRoomsWithFilter(
                    command.getKeyword(),
                    command.getRoomTypeId(),
                    command.getMinRent(),
                    command.getMaxRent(),
                    command.getFloor(),
                    pageable
            );
        }

        return roomRepositoryPort.findAvailablePrivateSpaces(pageable);
    }

    @Override
    public Optional<Room> getRoom(Long spaceId) {
        return roomRepositoryPort.findById(spaceId);
    }
}
