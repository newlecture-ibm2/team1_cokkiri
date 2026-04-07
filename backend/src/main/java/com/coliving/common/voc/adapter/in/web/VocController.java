package com.coliving.common.voc.adapter.in.web;

import com.coliving.common.voc.adapter.in.web.dto.req.VocMultipartRequestDto;
import com.coliving.common.voc.adapter.in.web.dto.req.VocUpdateMultipartRequestDto;
import com.coliving.common.voc.model.VocAttachment;
import com.coliving.common.voc.model.VocCategory;
import com.coliving.common.voc.adapter.in.web.dto.res.VocEditorImageResponseDto;
import com.coliving.common.voc.adapter.in.web.dto.res.VocAttachmentResponseDto;
import com.coliving.common.voc.adapter.in.web.dto.res.VocDetailResponseDto;
import com.coliving.common.voc.adapter.in.web.dto.res.VocListItemResponseDto;
import com.coliving.common.voc.adapter.in.web.dto.res.VocListResponseDto;
import com.coliving.common.voc.application.command.CancelVocCommand;
import com.coliving.common.voc.application.command.CreateVocCommand;
import com.coliving.common.voc.application.command.GetMyVocCommand;
import com.coliving.common.voc.application.command.ListMyVocsCommand;
import com.coliving.common.voc.application.command.UpdateVocCommand;
import com.coliving.common.voc.application.port.in.VocUseCase;
import com.coliving.common.voc.application.result.VocListItemResult;
import com.coliving.common.voc.application.result.VocListResult;
import com.coliving.common.voc.application.result.VocResult;
import com.coliving.global.dto.ApiResponse;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.global.json.MultipartRetainedJsonParser;
import com.coliving.global.storage.LocalMultipartFileStorage;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class VocController {

    private final VocUseCase vocUseCase;
    private final LocalMultipartFileStorage multipartFileStorage;
    private final ObjectMapper objectMapper;

    public VocController(VocUseCase vocUseCase,
                         LocalMultipartFileStorage multipartFileStorage,
                         ObjectMapper objectMapper) {
        this.vocUseCase = vocUseCase;
        this.multipartFileStorage = multipartFileStorage;
        this.objectMapper = objectMapper;
    }

    @PostMapping(value = "/api/vocs/upload-editor-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<VocEditorImageResponseDto> uploadEditorImage(@RequestPart("file") MultipartFile file) {
        getAuthenticatedUserId();
        VocAttachment stored = multipartFileStorage.storeSingleVocImage(file);
        VocEditorImageResponseDto dto = VocEditorImageResponseDto.builder()
                .url(stored.getFileUrl())
                .build();
        return ApiResponse.ok(dto);
    }

    @PostMapping(value = "/api/vocs", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<VocDetailResponseDto> createVoc(@Valid @ModelAttribute VocMultipartRequestDto form) {
        Long userId = getAuthenticatedUserId();
        VocCategory category = parseVocCategory(form.getCategory());

        CreateVocCommand command = CreateVocCommand.builder()
                .userId(userId)
                .category(category)
                .title(form.getTitle())
                .content(form.getContent())
                .attachments(multipartFileStorage.storeVocFiles(form.getFiles()))
                .build();

        VocResult result = vocUseCase.createVoc(command);
        return ApiResponse.ok(toDetailDto(result), "민원이 등록되었습니다.");
    }

    @GetMapping("/api/vocs/my")
    public ApiResponse<VocListResponseDto> listMyVocs(
            @RequestParam(value = "p", defaultValue = "0") int page,
            @RequestParam(value = "s", defaultValue = "20") int size,
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

    @GetMapping("/api/vocs/{vocId}")
    public ApiResponse<VocDetailResponseDto> getMyVoc(@PathVariable Long vocId) {
        Long userId = getAuthenticatedUserId();

        GetMyVocCommand command = GetMyVocCommand.builder()
                .userId(userId)
                .vocId(vocId)
                .build();

        VocResult result = vocUseCase.getMyVoc(command);
        return ApiResponse.ok(toDetailDto(result));
    }

    @PutMapping(value = "/api/vocs/{vocId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<VocDetailResponseDto> updateVoc(
            @PathVariable Long vocId,
            @Valid @ModelAttribute VocUpdateMultipartRequestDto form
    ) {
        Long userId = getAuthenticatedUserId();
        VocCategory category = parseVocCategory(form.getCategory());
        List<VocAttachment> retained = MultipartRetainedJsonParser.parseListOrNull(
                form.getAttachmentsJson(), objectMapper, new TypeReference<List<VocAttachment>>() {});
        List<VocAttachment> newFiles = multipartFileStorage.storeVocFiles(form.getFiles());

        UpdateVocCommand command = UpdateVocCommand.builder()
                .userId(userId)
                .vocId(vocId)
                .category(category)
                .title(form.getTitle())
                .content(form.getContent())
                .retainedAttachments(retained)
                .newFileAttachments(newFiles.isEmpty() ? null : newFiles)
                .build();

        VocResult result = vocUseCase.updateVoc(command);
        return ApiResponse.ok(toDetailDto(result));
    }

    @PostMapping("/api/vocs/{vocId}/cancel")
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
                .category(item.getCategory() != null ? item.getCategory().name() : null)
                .title(item.getTitle())
                .status(item.getStatus() != null ? item.getStatus().name() : null)
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
                .category(r.getCategory() != null ? r.getCategory().name() : null)
                .title(r.getTitle())
                .content(r.getContent())
                .attachments(attachments)
                .status(r.getStatus() != null ? r.getStatus().name() : null)
                .adminReply(r.getAdminReply())
                .replyUserId(r.getReplyUserId())
                .repliedAt(r.getRepliedAt())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .build();
    }

    private VocCategory parseVocCategory(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        try {
            return VocCategory.valueOf(raw.trim());
        } catch (IllegalArgumentException e) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
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
