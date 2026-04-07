package com.coliving.common.voc.application.service;

import com.coliving.common.voc.application.command.CancelVocCommand;
import com.coliving.common.voc.application.command.CreateVocCommand;
import com.coliving.common.voc.application.command.GetMyVocCommand;
import com.coliving.common.voc.application.command.ListMyVocsCommand;
import com.coliving.common.voc.application.command.UpdateVocCommand;
import com.coliving.common.voc.application.port.in.VocUseCase;
import com.coliving.common.notification.application.port.out.NotificationRepositoryPort;
import com.coliving.common.notification.model.ReferenceType;
import com.coliving.common.voc.application.port.out.VocRepositoryPort;
import com.coliving.common.voc.application.result.VocListItemResult;
import com.coliving.common.voc.application.result.VocListResult;
import com.coliving.common.voc.application.result.VocResult;
import com.coliving.common.voc.model.Voc;
import com.coliving.common.voc.model.VocAttachment;
import com.coliving.common.voc.model.VocStatus;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.global.attachment.RetainedAttachmentResolver;
import com.coliving.global.html.PlainTextHtmlSanitizer;
import com.coliving.global.html.VocBodyHtmlPathNormalizer;
import com.coliving.global.html.VocBodyHtmlSanitizer;
import com.coliving.global.validation.PlainTextFieldValidation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class VocService implements VocUseCase {
    private static final Set<String> ALLOWED_SORT_PROPERTIES = Set.of(
            "createdAt", "updatedAt", "status"
    );

    private final VocRepositoryPort vocRepositoryPort;
    private final NotificationRepositoryPort notificationRepositoryPort;

    public VocService(VocRepositoryPort vocRepositoryPort,
                      NotificationRepositoryPort notificationRepositoryPort) {
        this.vocRepositoryPort = vocRepositoryPort;
        this.notificationRepositoryPort = notificationRepositoryPort;
    }

    @Override
    @Transactional
    public VocResult createVoc(CreateVocCommand command) {
        Voc created = vocRepositoryPort.create(
                command.getUserId(),
                command.getCategory(),
                PlainTextFieldValidation.requireNonBlankTitleForSave(command.getTitle()),
                VocBodyHtmlSanitizer.sanitize(command.getContent()),
                command.getAttachments()
        );
        return toVocResult(created);
    }

    @Override
    @Transactional(readOnly = true)
    public VocListResult listMyVocs(ListMyVocsCommand command) {
        int safePage = Math.max(0, command.getPage());
        int safeSize = normalizeSize(command.getSize());
        Sort sort = parseSort(command.getSort());
        PageRequest pageRequest = PageRequest.of(safePage, safeSize, sort);

        Page<Voc> page = vocRepositoryPort.findByUserId(command.getUserId(), pageRequest);

        List<VocListItemResult> content = page.getContent().stream()
                .map(v -> VocListItemResult.builder()
                        .vocId(v.getVocId())
                        .category(v.getCategory())
                        .title(PlainTextHtmlSanitizer.sanitizeTitle(v.getTitle()))
                        .status(v.getStatus())
                        .createdAt(v.getCreatedAt())
                        .build())
                .toList();

        return VocListResult.builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public VocResult getMyVoc(GetMyVocCommand command) {
        Voc voc = vocRepositoryPort.findByVocIdAndUserId(command.getVocId(), command.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        return toVocResult(voc);
    }

    @Override
    @Transactional
    public VocResult updateVoc(UpdateVocCommand command) {
        Voc existing = vocRepositoryPort.findByVocIdAndUserId(command.getVocId(), command.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (existing.getStatus() != VocStatus.OPEN) {
            throw new BusinessException(ErrorCode.INVALID_STATUS);
        }

        List<VocAttachment> base;
        if (command.getRetainedAttachments() != null) {
            base = RetainedAttachmentResolver.resolve(
                    existing.getAttachments(),
                    command.getRetainedAttachments(),
                    VocAttachment::getFileUrl,
                    VocBodyHtmlPathNormalizer::normalizeAttachmentUrlForMatch);
        } else {
            base = existing.getAttachments() == null
                    ? new ArrayList<>()
                    : new ArrayList<>(existing.getAttachments());
        }
        if (command.getNewFileAttachments() != null && !command.getNewFileAttachments().isEmpty()) {
            base.addAll(command.getNewFileAttachments());
        }

        Voc updated = vocRepositoryPort.updateOwned(
                command.getVocId(),
                command.getUserId(),
                command.getCategory(),
                PlainTextFieldValidation.requireNonBlankTitleForSave(command.getTitle()),
                VocBodyHtmlSanitizer.sanitize(command.getContent()),
                base
        );
        return toVocResult(updated);
    }

    @Override
    @Transactional
    public VocResult cancelVoc(CancelVocCommand command) {
        Voc existing = vocRepositoryPort.findByVocIdAndUserId(command.getVocId(), command.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (existing.getStatus() != VocStatus.OPEN) {
            throw new BusinessException(ErrorCode.INVALID_STATUS);
        }

        vocRepositoryPort.cancelOwned(command.getVocId(), command.getUserId());
        notificationRepositoryPort.softDeleteByReference(ReferenceType.VOC, command.getVocId());

        Voc cancelled = vocRepositoryPort.findByVocIdAndUserId(command.getVocId(), command.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        return toVocResult(cancelled);
    }

    private VocResult toVocResult(Voc v) {
        return VocResult.builder()
                .vocId(v.getVocId())
                .userId(v.getUserId())
                .category(v.getCategory())
                .title(PlainTextHtmlSanitizer.sanitizeTitle(v.getTitle()))
                .content(VocBodyHtmlSanitizer.sanitize(v.getContent()))
                .attachments(v.getAttachments())
                .status(v.getStatus())
                .adminReply(safeAdminReply(v.getAdminReply()))
                .replyUserId(v.getReplyUserId())
                .repliedAt(v.getRepliedAt())
                .createdAt(v.getCreatedAt())
                .updatedAt(v.getUpdatedAt())
                .build();
    }

    private String safeAdminReply(String reply) {
        if (reply == null) {
            return null;
        }
        return VocBodyHtmlSanitizer.sanitize(reply);
    }

    private Sort parseSort(String sort) {
        if (sort == null || sort.isBlank()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        String[] parts = sort.split(",");
        if (parts.length != 2) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }

        String property = parts[0].trim();
        Sort.Direction direction = "asc".equalsIgnoreCase(parts[1].trim())
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        String safeProperty = property.isBlank() ? "createdAt" : property;
        if (!ALLOWED_SORT_PROPERTIES.contains(safeProperty)) {
            safeProperty = "createdAt";
        }

        return Sort.by(direction, safeProperty);
    }

    private int normalizeSize(int size) {
        if (size <= 0) {
            return 20;
        }
        return Math.min(size, 100);
    }
}
