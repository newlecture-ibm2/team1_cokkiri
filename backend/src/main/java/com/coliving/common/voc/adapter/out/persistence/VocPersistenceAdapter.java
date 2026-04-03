package com.coliving.common.voc.adapter.out.persistence;

import com.coliving.common.voc.adapter.out.jpa.VocEntity;
import com.coliving.common.voc.adapter.out.jpa.VocJpaRepository;
import com.coliving.common.voc.application.port.out.VocRepositoryPort;
import com.coliving.common.voc.model.Voc;
import com.coliving.common.voc.model.VocAttachment;
import com.coliving.common.voc.model.VocCategory;
import com.coliving.common.voc.model.VocStatus;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
public class VocPersistenceAdapter implements VocRepositoryPort {

    private final VocJpaRepository vocJpaRepository;
    private final ObjectMapper objectMapper;

    public VocPersistenceAdapter(VocJpaRepository vocJpaRepository, ObjectMapper objectMapper) {
        this.vocJpaRepository = vocJpaRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public Voc create(Long userId, VocCategory category, String title, String content, List<VocAttachment> attachments) {
        VocEntity entity = new VocEntity();
        entity.setUserId(userId);
        entity.setCategory(category);
        entity.setTitle(title);
        entity.setContent(content);
        entity.setAttachments(toJsonArray(attachments));
        entity.setStatus(VocStatus.OPEN);
        entity = vocJpaRepository.save(entity);
        return toModel(entity);
    }

    @Override
    public Optional<Voc> findByVocIdAndUserId(Long vocId, Long userId) {
        return vocJpaRepository.findByVocIdAndUserId(vocId, userId).map(this::toModel);
    }

    @Override
    public Optional<Voc> findByVocId(Long vocId) {
        return vocJpaRepository.findById(vocId).map(this::toModel);
    }

    @Override
    public Page<Voc> findByUserId(Long userId, Pageable pageable) {
        return vocJpaRepository.findByUserId(userId, pageable).map(this::toModel);
    }

    @Override
    public Page<Voc> findPageForAdmin(VocStatus status, Pageable pageable) {
        return vocJpaRepository.findPageByOptionalStatus(status, pageable).map(this::toModel);
    }

    @Override
    public Voc updateOwned(Long vocId, Long userId, VocCategory category, String title, String content,
                          List<VocAttachment> attachments) {
        VocEntity entity = vocJpaRepository.findByVocIdAndUserId(vocId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        entity.setCategory(category);
        entity.setTitle(title);
        entity.setContent(content);
        entity.setAttachments(toJsonArray(attachments));
        entity = vocJpaRepository.save(entity);
        return toModel(entity);
    }

    @Override
    public void cancelOwned(Long vocId, Long userId) {
        VocEntity entity = vocJpaRepository.findByVocIdAndUserId(vocId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        entity.setStatus(VocStatus.CANCELLED);
        vocJpaRepository.save(entity);
    }

    @Override
    public Voc applyAdminReply(Long vocId, Long adminUserId, String reply) {
        VocEntity entity = vocJpaRepository.findById(vocId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (entity.getStatus() == VocStatus.CANCELLED || entity.getStatus() == VocStatus.RESOLVED) {
            throw new BusinessException(ErrorCode.INVALID_STATUS);
        }

        entity.setAdminReply(reply);
        entity.setReplyUserId(adminUserId);
        entity.setRepliedAt(OffsetDateTime.now());
        if (entity.getStatus() == VocStatus.OPEN) {
            entity.setStatus(VocStatus.IN_PROGRESS);
        }

        entity = vocJpaRepository.save(entity);
        return toModel(entity);
    }

    @Override
    public Voc markResolved(Long vocId) {
        VocEntity entity = vocJpaRepository.findById(vocId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (entity.getStatus() != VocStatus.OPEN && entity.getStatus() != VocStatus.IN_PROGRESS) {
            throw new BusinessException(ErrorCode.INVALID_STATUS);
        }

        entity.setStatus(VocStatus.RESOLVED);
        entity = vocJpaRepository.save(entity);
        return toModel(entity);
    }

    private Voc toModel(VocEntity entity) {
        return Voc.builder()
                .vocId(entity.getVocId())
                .userId(entity.getUserId())
                .category(entity.getCategory())
                .title(entity.getTitle())
                .content(entity.getContent())
                .attachments(parseAttachments(entity.getAttachments()))
                .status(entity.getStatus())
                .adminReply(entity.getAdminReply())
                .replyUserId(entity.getReplyUserId())
                .repliedAt(entity.getRepliedAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private JsonNode toJsonArray(List<VocAttachment> items) {
        if (items == null) {
            return objectMapper.createArrayNode();
        }
        return objectMapper.valueToTree(items);
    }

    private List<VocAttachment> parseAttachments(JsonNode node) {
        if (node == null || !node.isArray()) {
            return Collections.emptyList();
        }

        List<VocAttachment> result = new java.util.ArrayList<>();
        for (JsonNode element : node) {
            if (element == null || element.isNull()) {
                continue;
            }
            String fileUrl = element.hasNonNull("fileUrl") ? element.get("fileUrl").asText() : null;
            String fileName = element.hasNonNull("fileName") ? element.get("fileName").asText() : null;
            Long fileSize = element.hasNonNull("fileSize") ? element.get("fileSize").asLong() : null;
            result.add(VocAttachment.builder()
                    .fileUrl(fileUrl)
                    .fileName(fileName)
                    .fileSize(fileSize)
                    .build());
        }
        return result;
    }
}
