package com.coliving.admin.voc.application.service;

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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminVocService implements AdminVocUseCase {

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
        Sort sort = parseSort(command.getSort());
        PageRequest pageRequest = PageRequest.of(command.getPage(), command.getSize(), sort);

        Page<Voc> page = vocRepositoryPort.findPageForAdmin(command.getStatus(), pageRequest);

        List<AdminVocListItemResult> content = page.getContent().stream()
                .map(v -> AdminVocListItemResult.builder()
                        .vocId(v.getVocId())
                        .userId(v.getUserId())
                        .category(v.getCategory())
                        .title(v.getTitle())
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
    @Transactional
    public VocResult replyToVoc(ReplyVocCommand command) {
        Voc updated = vocRepositoryPort.applyAdminReply(
                command.getVocId(),
                command.getAdminUserId(),
                command.getReply()
        );

        createNotificationUseCase.create(CreateNotificationCommand.builder()
                .userId(updated.getUserId())
                .type(NotificationType.VOC_REPLIED)
                .title("민원 답변이 등록되었습니다")
                .message(buildNotificationMessage(updated.getTitle(), command.getReply()))
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

    private String buildNotificationMessage(String vocTitle, String reply) {
        String titlePart = vocTitle != null && !vocTitle.isBlank() ? "「" + vocTitle + "」" : "등록하신 민원";
        String preview = reply == null ? "" : reply.strip();
        if (preview.length() > 200) {
            preview = preview.substring(0, 200) + "…";
        }
        return titlePart + "에 관리자 답변이 등록되었습니다. " + preview;
    }

    private VocResult toVocResult(Voc v) {
        return VocResult.builder()
                .vocId(v.getVocId())
                .userId(v.getUserId())
                .category(v.getCategory())
                .title(v.getTitle())
                .content(v.getContent())
                .attachments(v.getAttachments())
                .status(v.getStatus())
                .adminReply(v.getAdminReply())
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

        return Sort.by(direction, property.isBlank() ? "createdAt" : property);
    }
}
