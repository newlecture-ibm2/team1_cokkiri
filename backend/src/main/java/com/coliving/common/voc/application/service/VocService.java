package com.coliving.common.voc.application.service;

import com.coliving.common.voc.application.command.CancelVocCommand;
import com.coliving.common.voc.application.command.CreateVocCommand;
import com.coliving.common.voc.application.command.GetMyVocCommand;
import com.coliving.common.voc.application.command.ListMyVocsCommand;
import com.coliving.common.voc.application.command.UpdateVocCommand;
import com.coliving.common.voc.application.port.in.VocUseCase;
import com.coliving.common.notification.application.port.out.NotificationRepositoryPort;
import com.coliving.common.notification.model.ReferenceType;
import com.coliving.common.voc.application.event.VocAdminNotifyEvent;
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
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
public class VocService implements VocUseCase {
    private static final Set<String> ALLOWED_SORT_PROPERTIES = Set.of(
            "createdAt", "updatedAt", "status");

    private final VocRepositoryPort vocRepositoryPort;
    private final NotificationRepositoryPort notificationRepositoryPort;
    private final ApplicationEventPublisher eventPublisher;

    public VocService(VocRepositoryPort vocRepositoryPort,
            NotificationRepositoryPort notificationRepositoryPort,
            ApplicationEventPublisher eventPublisher) {
        this.vocRepositoryPort = vocRepositoryPort;
        this.notificationRepositoryPort = notificationRepositoryPort;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public VocResult createVoc(CreateVocCommand command) {
        Voc created = vocRepositoryPort.create(
                command.getUserId(),
                command.getCategory(),
                PlainTextFieldValidation.requireNonBlankTitleForSave(command.getTitle()),
                VocBodyHtmlSanitizer.sanitize(command.getContent()),
                command.getAttachments());

        eventPublisher.publishEvent(new VocAdminNotifyEvent(
                created.getVocId(),
                created.getTitle(),
                "새로운 민원이 등록되었습니다"));

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
        return toVocResult(requireMyVoc(command.getVocId(), command.getUserId()));
    }

    @Override
    @Transactional
    public VocResult updateVoc(UpdateVocCommand command) {
        Voc existing = requireMyVoc(command.getVocId(), command.getUserId());

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
                base);

        eventPublisher.publishEvent(new VocAdminNotifyEvent(
                updated.getVocId(),
                updated.getTitle(),
                "민원이 수정되었습니다"));

        return toVocResult(updated);
    }

    @Override
    @Transactional
    public VocResult cancelVoc(CancelVocCommand command) {
        Voc existing = requireMyVoc(command.getVocId(), command.getUserId());

        if (existing.getStatus() != VocStatus.OPEN) {
            throw new BusinessException(ErrorCode.INVALID_STATUS);
        }

        vocRepositoryPort.cancelOwned(command.getVocId(), command.getUserId());
        notificationRepositoryPort.softDeleteByReference(ReferenceType.VOC, command.getVocId());

        eventPublisher.publishEvent(new VocAdminNotifyEvent(
                existing.getVocId(),
                existing.getTitle(),
                "민원이 취소되었습니다"));

        Voc cancelled = vocRepositoryPort.findByVocIdAndUserId(command.getVocId(), command.getUserId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        return toVocResult(cancelled);
    }

    /**
     * 존재하지 않는 민원은 404, 타인 소유 민원은 403으로 구분합니다(강제 URL 접근 시에도 상태 코드가 명확히 구분됨).
     */
    private Voc requireMyVoc(Long vocId, Long userId) {
        Voc voc = vocRepositoryPort.findByVocId(vocId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        if (!Objects.equals(voc.getUserId(), userId)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        return voc;
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
