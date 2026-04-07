package com.coliving.admin.voc.application.service;

import com.coliving.admin.voc.application.command.GetAdminVocCommand;
import com.coliving.admin.voc.application.command.ListAdminVocsCommand;
import com.coliving.admin.voc.application.command.ReplyVocCommand;
import com.coliving.admin.voc.application.command.ResolveVocCommand;
import com.coliving.admin.voc.application.port.in.AdminVocUseCase;
import com.coliving.admin.voc.application.result.AdminVocListItemResult;
import com.coliving.admin.voc.application.result.AdminVocListResult;
import com.coliving.common.notification.application.command.CreateNotificationCommand;
import com.coliving.common.notification.application.port.in.CreateNotificationUseCase;
import com.coliving.common.notification.model.NotificationType;
import com.coliving.common.notification.model.ReferenceType;
import com.coliving.common.voc.application.port.out.VocRepositoryPort;
import com.coliving.common.voc.application.result.VocResult;
import com.coliving.common.voc.model.Voc;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.coliving.global.html.PlainTextHtmlSanitizer;
import com.coliving.global.html.VocBodyHtmlSanitizer;
import com.coliving.global.validation.PlainTextFieldValidation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class AdminVocService implements AdminVocUseCase {
    private static final Set<String> ALLOWED_SORT_PROPERTIES = Set.of(
            "createdAt", "updatedAt", "status"
    );

    private final VocRepositoryPort vocRepositoryPort;
    private final CreateNotificationUseCase createNotificationUseCase;

    public AdminVocService(VocRepositoryPort vocRepositoryPort,
                           CreateNotificationUseCase createNotificationUseCase) {
        this.vocRepositoryPort = vocRepositoryPort;
        this.createNotificationUseCase = createNotificationUseCase;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminVocListResult listVocs(ListAdminVocsCommand command) {
        int safePage = Math.max(0, command.getPage());
        int safeSize = normalizeSize(command.getSize());
        Sort sort = parseSort(command.getSort());
        PageRequest pageRequest = PageRequest.of(safePage, safeSize, sort);

        Page<Voc> page = vocRepositoryPort.findPageForAdmin(command.getStatus(), pageRequest);

        List<AdminVocListItemResult> content = page.getContent().stream()
                .map(v -> AdminVocListItemResult.builder()
                        .vocId(v.getVocId())
                        .userId(v.getUserId())
                        .category(v.getCategory())
                        .title(PlainTextHtmlSanitizer.sanitizeTitle(v.getTitle()))
                        .status(v.getStatus())
                        .createdAt(v.getCreatedAt())
                        .build())
                .toList();

        return AdminVocListResult.builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public VocResult getVoc(GetAdminVocCommand command) {
        Voc voc = vocRepositoryPort.findByVocId(command.getVocId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        return toVocResult(voc);
    }

    @Override
    @Transactional
    public VocResult replyToVoc(ReplyVocCommand command) {
        String sanitizedReply = VocBodyHtmlSanitizer.sanitize(command.getReply());
        PlainTextFieldValidation.requireNonBlankPlainAfterSanitizedHtml(sanitizedReply);
        Voc updated = vocRepositoryPort.applyAdminReply(
                command.getVocId(),
                command.getAdminUserId(),
                sanitizedReply
        );

        createNotificationUseCase.create(CreateNotificationCommand.builder()
                .userId(updated.getUserId())
                .type(NotificationType.VOC_REPLIED)
                .title("민원 답변이 등록되었습니다")
                .message(buildNotificationMessage(updated.getTitle(), sanitizedReply))
                .referenceType(ReferenceType.VOC)
                .referenceId(updated.getVocId())
                .build());

        return toVocResult(updated);
    }

    @Override
    @Transactional
    public VocResult resolveVoc(ResolveVocCommand command) {
        Voc resolved = vocRepositoryPort.markResolved(command.getVocId());
        return toVocResult(resolved);
    }

    private String buildNotificationMessage(String vocTitle, String replyHtmlOrText) {
        String safeTitle = PlainTextHtmlSanitizer.sanitizeTitle(vocTitle);
        String titlePart = !safeTitle.isBlank() ? "「" + safeTitle + "」" : "등록하신 민원";
        String preview = PlainTextHtmlSanitizer.toSingleLinePreview(replyHtmlOrText, 200);
        return titlePart + "에 관리자 답변이 등록되었습니다. " + preview;
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
                .adminReply(v.getAdminReply() == null ? null : VocBodyHtmlSanitizer.sanitize(v.getAdminReply()))
                .replyUserId(v.getReplyUserId())
                .repliedAt(v.getRepliedAt())
                .createdAt(v.getCreatedAt())
                .updatedAt(v.getUpdatedAt())
                .build();
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
