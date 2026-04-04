package com.coliving.admin.voc.adapter.in.web;

import com.coliving.admin.voc.adapter.in.web.dto.req.AdminReplyVocRequestDto;
import com.coliving.admin.voc.adapter.in.web.dto.res.AdminVocAttachmentResponseDto;
import com.coliving.admin.voc.adapter.in.web.dto.res.AdminVocDetailResponseDto;
import com.coliving.admin.voc.adapter.in.web.dto.res.AdminVocListItemResponseDto;
import com.coliving.admin.voc.adapter.in.web.dto.res.AdminVocListResponseDto;
import com.coliving.admin.voc.application.command.GetAdminVocCommand;
import com.coliving.admin.voc.application.command.ListAdminVocsCommand;
import com.coliving.admin.voc.application.command.ReplyVocCommand;
import com.coliving.admin.voc.application.command.ResolveVocCommand;
import com.coliving.admin.voc.application.port.in.AdminVocUseCase;
import com.coliving.admin.voc.application.result.AdminVocListItemResult;
import com.coliving.admin.voc.application.result.AdminVocListResult;
import com.coliving.common.voc.application.result.VocResult;
import com.coliving.common.voc.model.VocStatus;
import com.coliving.global.dto.ApiResponse;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class AdminVocController {

    private final AdminVocUseCase adminVocUseCase;

    public AdminVocController(AdminVocUseCase adminVocUseCase) {
        this.adminVocUseCase = adminVocUseCase;
    }

    @GetMapping("/api/admin/voc")
    public ApiResponse<AdminVocListResponseDto> listVocs(
            @RequestParam(required = false) String status,
            @RequestParam(value = "p", defaultValue = "0") int page,
            @RequestParam(value = "s", defaultValue = "20") int size,
            @RequestParam(required = false, defaultValue = "createdAt,desc") String sort
    ) {
        VocStatus statusFilter = parseStatusOrNull(status);

        ListAdminVocsCommand command = ListAdminVocsCommand.builder()
                .status(statusFilter)
                .page(page)
                .size(size)
                .sort(sort)
                .build();

        AdminVocListResult result = adminVocUseCase.listVocs(command);

        AdminVocListResponseDto response = AdminVocListResponseDto.builder()
                .content(result.getContent().stream().map(this::toListItemDto).toList())
                .page(result.getPage())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .build();

        return ApiResponse.ok(response);
    }

    @GetMapping("/api/admin/voc/{vocId}")
    public ApiResponse<AdminVocDetailResponseDto> getVoc(@PathVariable Long vocId) {
        GetAdminVocCommand command = GetAdminVocCommand.builder()
                .vocId(vocId)
                .build();

        VocResult result = adminVocUseCase.getVoc(command);
        return ApiResponse.ok(toDetailDto(result));
    }

    @PostMapping("/api/admin/voc/{vocId}/reply")
    public ApiResponse<AdminVocDetailResponseDto> reply(
            @PathVariable Long vocId,
            @Valid @RequestBody AdminReplyVocRequestDto request
    ) {
        Long adminUserId = getAuthenticatedUserId();

        ReplyVocCommand command = ReplyVocCommand.builder()
                .vocId(vocId)
                .adminUserId(adminUserId)
                .reply(request.getReply())
                .build();

        VocResult result = adminVocUseCase.replyToVoc(command);
        return ApiResponse.ok(toDetailDto(result));
    }

    @PostMapping("/api/admin/voc/{vocId}/resolve")
    public ApiResponse<AdminVocDetailResponseDto> resolveVoc(@PathVariable Long vocId) {
        ResolveVocCommand command = ResolveVocCommand.builder()
                .vocId(vocId)
                .build();

        VocResult result = adminVocUseCase.resolveVoc(command);
        return ApiResponse.ok(toDetailDto(result), "민원이 처리 완료되었습니다.");
    }

    private VocStatus parseStatusOrNull(String status) {
        if (status == null || status.isBlank()) {
            return null;
        }
        try {
            return VocStatus.valueOf(status.trim());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
    }

    private AdminVocListItemResponseDto toListItemDto(AdminVocListItemResult item) {
        return AdminVocListItemResponseDto.builder()
                .vocId(item.getVocId())
                .userId(item.getUserId())
                .category(item.getCategory().name())
                .title(item.getTitle())
                .status(item.getStatus().name())
                .createdAt(item.getCreatedAt())
                .build();
    }

    private AdminVocDetailResponseDto toDetailDto(VocResult r) {
        List<AdminVocAttachmentResponseDto> attachments = r.getAttachments() == null
                ? List.of()
                : r.getAttachments().stream()
                .map(a -> AdminVocAttachmentResponseDto.builder()
                        .fileUrl(a.getFileUrl())
                        .fileName(a.getFileName())
                        .fileSize(a.getFileSize())
                        .build())
                .toList();

        return AdminVocDetailResponseDto.builder()
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
