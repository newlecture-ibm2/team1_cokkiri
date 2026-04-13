package com.coliving.user.history.application.service;

import com.coliving.admin.space.adapter.out.jpa.SpaceEntity;
import com.coliving.admin.space.adapter.out.jpa.SpaceJpaRepository;
import com.coliving.common.comment.adapter.out.jpa.CommentEntity;
import com.coliving.common.comment.adapter.out.jpa.CommentJpaRepository;
import com.coliving.common.community.adapter.out.jpa.PostEntity;
import com.coliving.common.community.adapter.out.jpa.PostJpaRepository;
import com.coliving.user.contract.adapter.out.jpa.ContractEntity;
import com.coliving.user.contract.adapter.out.jpa.ContractJpaRepository;
import com.coliving.user.contract.model.ContractStatus;
import com.coliving.user.history.application.port.in.ViewHistoryUseCase;
import com.coliving.user.history.application.result.HistoryItemResult;
import com.coliving.user.history.application.result.HistoryListResult;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * USR-HST-01: 사용자 활동 이력 서비스
 * 
 * 타 도메인 JpaRepository를 READ 전용으로만 사용한다 (04-domain-collaboration §1).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HistoryService implements ViewHistoryUseCase {

    private final ContractJpaRepository contractJpaRepository;
    private final PostJpaRepository postJpaRepository;
    private final CommentJpaRepository commentJpaRepository;
    private final SpaceJpaRepository spaceJpaRepository;

    // 계약 이력에 포함할 상태 (진행중이 아닌 확정/종료 계약)
    private static final Set<ContractStatus> CONTRACT_STATUSES = Set.of(
            ContractStatus.ACTIVE, ContractStatus.EXPIRED, ContractStatus.TERMINATED
    );

    // 신청 이력에 포함할 상태
    private static final Set<ContractStatus> APPLICATION_STATUSES = Set.of(
            ContractStatus.DRAFT, ContractStatus.PENDING,
            ContractStatus.APPROVED, ContractStatus.REJECTED, ContractStatus.CANCELLED
    );

    @Override
    public HistoryListResult viewHistory(Long userId, String type, int page, int size) {
        List<HistoryItemResult> allItems = new ArrayList<>();

        if (type == null || type.isEmpty()) {
            // 전체 이력
            allItems.addAll(fetchContractHistory(userId));
            allItems.addAll(fetchApplicationHistory(userId));
            allItems.addAll(fetchPostHistory(userId));
            allItems.addAll(fetchCommentHistory(userId));
        } else {
            switch (type.toUpperCase()) {
                case "CONTRACT":
                    allItems.addAll(fetchContractHistory(userId));
                    break;
                case "APPLICATION":
                    allItems.addAll(fetchApplicationHistory(userId));
                    break;
                case "POST":
                    allItems.addAll(fetchPostHistory(userId));
                    break;
                case "COMMENT":
                    allItems.addAll(fetchCommentHistory(userId));
                    break;
                default:
                    // 알 수 없는 타입 → 빈 목록
                    break;
            }
        }

        // 최신순 정렬
        allItems.sort(Comparator.comparing(HistoryItemResult::getCreatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())));

        // 수동 페이징
        long totalElements = allItems.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int fromIndex = Math.min(page * size, allItems.size());
        int toIndex = Math.min(fromIndex + size, allItems.size());

        List<HistoryItemResult> pageContent = allItems.subList(fromIndex, toIndex);

        return HistoryListResult.builder()
                .content(pageContent)
                .page(page)
                .size(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .build();
    }

    /**
     * 계약 이력: ACTIVE / EXPIRED / TERMINATED 만 (진행중 리스트에 EXPIRED가 혼입되지 않도록)
     */
    private List<HistoryItemResult> fetchContractHistory(Long userId) {
        List<ContractEntity> contracts = contractJpaRepository.findByUserIdOrderByCreatedAtDesc(userId);

        // 공간명 일괄 조회
        List<Long> spaceIds = contracts.stream()
                .map(ContractEntity::getSpaceId)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, String> spaceNames = spaceJpaRepository.findAllById(spaceIds).stream()
                .collect(Collectors.toMap(SpaceEntity::getSpaceId, SpaceEntity::getName));

        return contracts.stream()
                .filter(c -> CONTRACT_STATUSES.contains(c.getStatus()))
                .map(c -> HistoryItemResult.builder()
                        .historyType("CONTRACT")
                        .referenceId(c.getContractId())
                        .title(spaceNames.getOrDefault(c.getSpaceId(), "호실 #" + c.getSpaceId()))
                        .description(formatContractPeriod(c))
                        .status(c.getStatus().name())
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 신청 이력: DRAFT / PENDING / APPROVED / REJECTED / CANCELLED
     */
    private List<HistoryItemResult> fetchApplicationHistory(Long userId) {
        List<ContractEntity> contracts = contractJpaRepository.findByUserIdOrderByCreatedAtDesc(userId);

        List<Long> spaceIds = contracts.stream()
                .map(ContractEntity::getSpaceId)
                .distinct()
                .collect(Collectors.toList());
        Map<Long, String> spaceNames = spaceJpaRepository.findAllById(spaceIds).stream()
                .collect(Collectors.toMap(SpaceEntity::getSpaceId, SpaceEntity::getName));

        return contracts.stream()
                .filter(c -> APPLICATION_STATUSES.contains(c.getStatus()))
                .map(c -> HistoryItemResult.builder()
                        .historyType("APPLICATION")
                        .referenceId(c.getContractId())
                        .title(spaceNames.getOrDefault(c.getSpaceId(), "호실 #" + c.getSpaceId()))
                        .description(c.getDesiredStartDate() != null
                                ? "희망 시작일: " + c.getDesiredStartDate()
                                : "신청")
                        .status(c.getStatus().name())
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 게시글 이력
     */
    private List<HistoryItemResult> fetchPostHistory(Long userId) {
        // Spec Executor로 userId 필터링
        return postJpaRepository.findAll(
                (root, query, cb) -> cb.equal(root.get("userId"), userId),
                PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent().stream()
                .map(p -> HistoryItemResult.builder()
                        .historyType("POST")
                        .referenceId(p.getPostId())
                        .title(p.getTitle())
                        .description(mapCategory(p.getCategory()))
                        .status(null)
                        .createdAt(p.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * 댓글 이력
     */
    private List<HistoryItemResult> fetchCommentHistory(Long userId) {
        return commentJpaRepository.findAll(
                (root, query, cb) -> cb.equal(root.get("userId"), userId),
                PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "createdAt"))
        ).getContent().stream()
                .map(c -> HistoryItemResult.builder()
                        .historyType("COMMENT")
                        .referenceId(c.getCommentId())
                        .title(truncate(c.getContent(), 60))
                        .description(c.getPost() != null ? c.getPost().getTitle() : null)
                        .status(null)
                        .createdAt(c.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    // ── 헬퍼 ──

    private String formatContractPeriod(ContractEntity c) {
        if (c.getStartDate() != null && c.getEndDate() != null) {
            return c.getStartDate() + " ~ " + c.getEndDate();
        }
        return "기간 미확정";
    }

    private String mapCategory(String category) {
        if (category == null) return "";
        return switch (category) {
            case "NOTICE" -> "공지";
            case "QUESTION" -> "질문";
            case "SUGGESTION" -> "제안";
            case "MEETUP" -> "모임";
            case "FREE" -> "자유";
            default -> category;
        };
    }

    private String truncate(String text, int maxLen) {
        if (text == null) return "";
        return text.length() > maxLen ? text.substring(0, maxLen) + "…" : text;
    }
}
