package com.coliving.common.voc.adapter.in.web;

import com.coliving.common.voc.adapter.in.web.dto.req.CreateVocRequestDto;
import com.coliving.common.voc.adapter.in.web.dto.req.UpdateVocRequestDto;
import com.coliving.common.voc.adapter.in.web.dto.res.VocAttachmentResponseDto;
import com.coliving.common.voc.adapter.in.web.dto.res.VocDetailResponseDto;
import com.coliving.common.voc.adapter.in.web.dto.res.VocListItemResponseDto;
import com.coliving.common.voc.adapter.in.web.dto.res.VocListResponseDto;
import com.coliving.common.voc.application.command.CancelVocCommand;
import com.coliving.common.voc.application.command.CreateVocCommand;
import com.coliving.common.voc.application.command.ListMyVocsCommand;
import com.coliving.common.voc.application.command.UpdateVocCommand;
import com.coliving.common.voc.application.port.in.VocUseCase;
import com.coliving.common.voc.application.result.VocListItemResult;
import com.coliving.common.voc.application.result.VocListResult;
import com.coliving.common.voc.application.result.VocResult;
import com.coliving.global.dto.ApiResponse;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class VocController {

    private final VocUseCase vocUseCase;

    public VocController(VocUseCase vocUseCase) {
        this.vocUseCase = vocUseCase;
    }

    @PostMapping("/api/voc")
    public ApiResponse<VocDetailResponseDto> createVoc(@Valid @RequestBody CreateVocRequestDto request) {
        Long userId = getAuthenticatedUserId();

        CreateVocCommand command = CreateVocCommand.builder()
                .userId(userId)
                .category(request.getCategory())
                .title(request.getTitle())
                .content(request.getContent())
                .attachments(request.getAttachments())
                .build();

        VocResult result = vocUseCase.createVoc(command);
        return ApiResponse.ok(toDetailDto(result), "민원이 등록되었습니다.");
    }

    @GetMapping("/api/voc/my")
    public ApiResponse<VocListResponseDto> listMyVocs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false, defaultValue = "createdAt,desc") String sort
    ) {
        Long userId = getAuthenticatedUserId();

        ListMyVocsCommand command = ListMyVocsCommand.builder()
                .userId(userId)
                .page(page)
                .size(size)
                .sort(sort)
                .build();

        VocListResult result = vocUseCase.listMyVocs(command);

        VocListResponseDto response = VocListResponseDto.builder()
                .content(result.getContent().stream().map(this::toListItemDto).toList())
                .page(result.getPage())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();

        return ApiResponse.ok(response);
    }

    @PutMapping("/api/voc/{vocId}")
    public ApiResponse<VocDetailResponseDto> updateVoc(
            @PathVariable Long vocId,
            @Valid @RequestBody UpdateVocRequestDto request
    ) {
        Long userId = getAuthenticatedUserId();

        UpdateVocCommand command = UpdateVocCommand.builder()
                .userId(userId)
                .vocId(vocId)
                .category(request.getCategory())
                .title(request.getTitle())
                .content(request.getContent())
                .attachments(request.getAttachments())
                .build();

        VocResult result = vocUseCase.updateVoc(command);
        return ApiResponse.ok(toDetailDto(result));
    }

    @PostMapping("/api/voc/{vocId}/cancel")
    public ApiResponse<VocDetailResponseDto> cancelVoc(@PathVariable Long vocId) {
        Long userId = getAuthenticatedUserId();

        CancelVocCommand command = CancelVocCommand.builder()
                .userId(userId)
                .vocId(vocId)
                .build();

        VocResult result = vocUseCase.cancelVoc(command);
        return ApiResponse.ok(toDetailDto(result), "민원이 취소되었습니다.");
    }

    private VocListItemResponseDto toListItemDto(VocListItemResult item) {
        return VocListItemResponseDto.builder()
                .vocId(item.getVocId())
                .category(item.getCategory().name())
                .title(item.getTitle())
                .status(item.getStatus().name())
                .createdAt(item.getCreatedAt())
                .build();
    }

    private VocDetailResponseDto toDetailDto(VocResult r) {
        List<VocAttachmentResponseDto> attachments = r.getAttachments() == null
                ? List.of()
                : r.getAttachments().stream()
                .map(a -> VocAttachmentResponseDto.builder()
                        .fileUrl(a.getFileUrl())
                        .fileName(a.getFileName())
                        .fileSize(a.getFileSize())
                        .build())
                .toList();

        return VocDetailResponseDto.builder()
                .vocId(r.getVocId())
                .userId(r.getUserId())
                .category(r.getCategory().name())
                .title(r.getTitle())
                .content(r.getContent())
                .attachments(attachments)
                .status(r.getStatus().name())
                .adminReply(r.getAdminReply())
                .replyUserId(r.getReplyUserId())
                .repliedAt(r.getRepliedAt())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private Long getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
    }
}
