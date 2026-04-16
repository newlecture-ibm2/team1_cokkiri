package com.coliving.admin.space.application.service;

import com.coliving.admin.space.application.command.CreateRoomTypeCommand;
import com.coliving.admin.space.application.command.UpdateRoomTypeCommand;
import com.coliving.admin.space.application.port.in.AdminRoomTypeUseCase;
import com.coliving.admin.space.application.port.out.AdminRoomTypeRepositoryPort;
import com.coliving.admin.space.application.result.AdminRoomTypeResult;
import com.coliving.admin.space.model.AdminRoomType;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminRoomTypeService implements AdminRoomTypeUseCase {

    private final AdminRoomTypeRepositoryPort adminRoomTypeRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public List<AdminRoomTypeResult> getRoomTypes() {
        return adminRoomTypeRepositoryPort.findAll().stream()
                .map(AdminRoomTypeResult::from)
                .toList();
    }

    @Override
    public AdminRoomTypeResult createRoomType(CreateRoomTypeCommand command) {
        if (adminRoomTypeRepositoryPort.existsByCode(command.getCode())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, "이미 동일한 코드의 방 유형이 존재합니다: " + command.getCode());
        }

        AdminRoomType model = AdminRoomType.builder()
                .code(command.getCode())
                .name(command.getName())
                .isSystemDefault(false)
                .build();

        AdminRoomType saved = adminRoomTypeRepositoryPort.save(model);
        return AdminRoomTypeResult.from(saved);
    }

    @Override
    public AdminRoomTypeResult updateRoomType(UpdateRoomTypeCommand command) {
        AdminRoomType existing = adminRoomTypeRepositoryPort.findById(command.getRoomTypeId())
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_TYPE_NOT_FOUND));

        AdminRoomType updated = AdminRoomType.builder()
                .roomTypeId(existing.getRoomTypeId())
                .code(existing.getCode())
                .name(command.getName())
                .isSystemDefault(existing.getIsSystemDefault())
                .build();

        AdminRoomType saved = adminRoomTypeRepositoryPort.save(updated);
        return AdminRoomTypeResult.from(saved);
    }

    @Override
    public void deleteRoomType(Long roomTypeId) {
        AdminRoomType existing = adminRoomTypeRepositoryPort.findById(roomTypeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ROOM_TYPE_NOT_FOUND));

        if (adminRoomTypeRepositoryPort.isUsedInSpaces(roomTypeId)) {
            throw new BusinessException(ErrorCode.INVALID_STATUS, "이 방 유형을 사용 중인 공간이 있어 삭제할 수 없습니다. 해당 공간의 유형을 먼저 변경해 주세요.");
        }

        adminRoomTypeRepositoryPort.delete(roomTypeId);
    }

    @Override
    public void updateRoomTypeOrder(List<Long> orderedIds) {
        List<AdminRoomType> updates = new java.util.ArrayList<>();
        for (int i = 0; i < orderedIds.size(); i++) {
            updates.add(AdminRoomType.builder()
                    .roomTypeId(orderedIds.get(i))
                    .sortOrder(i)
                    .build());
        }
        adminRoomTypeRepositoryPort.updateSortOrders(updates);
    }
}
