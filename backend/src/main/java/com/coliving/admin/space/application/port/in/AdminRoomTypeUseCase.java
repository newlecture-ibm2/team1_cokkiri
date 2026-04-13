package com.coliving.admin.space.application.port.in;

import com.coliving.admin.space.application.command.CreateRoomTypeCommand;
import com.coliving.admin.space.application.command.UpdateRoomTypeCommand;
import com.coliving.admin.space.application.result.AdminRoomTypeResult;

import java.util.List;

public interface AdminRoomTypeUseCase {
    List<AdminRoomTypeResult> getRoomTypes();
    AdminRoomTypeResult createRoomType(CreateRoomTypeCommand command);
    AdminRoomTypeResult updateRoomType(UpdateRoomTypeCommand command);
    void deleteRoomType(Long roomTypeId);
    void updateRoomTypeOrder(List<Long> orderedIds);
}
