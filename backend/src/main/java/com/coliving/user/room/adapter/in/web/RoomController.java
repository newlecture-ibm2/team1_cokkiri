package com.coliving.user.room.adapter.in.web;

import com.coliving.user.room.adapter.in.web.dto.RoomResponseDto;
import com.coliving.user.room.application.command.RoomListCommand;
import com.coliving.user.room.application.port.in.RoomUseCase;
import com.coliving.user.room.model.Room;

import com.coliving.global.dto.ApiResponse;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Tag(name = "Room", description = "유저 방 조회 API (Public)")
@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomUseCase roomUseCase;

    @Operation(summary = "방 목록 조회 (필터 + 페이지네이션)")
    @GetMapping
    public ApiResponse<Page<RoomResponseDto>> getRooms(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long roomTypeId,
            @RequestParam(required = false) BigDecimal minRent,
            @RequestParam(required = false) BigDecimal maxRent,
            @RequestParam(required = false) Integer floor,
            @PageableDefault(size = 12, sort = "name", direction = org.springframework.data.domain.Sort.Direction.ASC) Pageable pageable) {

        RoomListCommand command = RoomListCommand.builder()
                .keyword(keyword)
                .roomTypeId(roomTypeId)
                .minRent(minRent)
                .maxRent(maxRent)
                .floor(floor)
                .build();

        Page<RoomResponseDto> result = roomUseCase.getRooms(command, pageable)
                .map(RoomResponseDto::from);

        return ApiResponse.ok(result);
    }

    @Operation(summary = "방 단건 상세 조회")
    @GetMapping("/{spaceId}")
    public ApiResponse<RoomResponseDto> getRoom(@PathVariable Long spaceId) {
        Room room = roomUseCase.getRoom(spaceId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SPACE_NOT_FOUND));
        return ApiResponse.ok(RoomResponseDto.from(room));
    }
}
