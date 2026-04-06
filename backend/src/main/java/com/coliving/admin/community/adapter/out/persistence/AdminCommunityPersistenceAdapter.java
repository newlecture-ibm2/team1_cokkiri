package com.coliving.admin.community.adapter.out.persistence;

import com.coliving.admin.community.application.port.out.AdminCommunityRepositoryPort;
import com.coliving.admin.community.application.result.AdminCommentDetailResult;
import com.coliving.admin.community.application.result.AdminCommentListItemResult;
import com.coliving.admin.community.application.result.AdminPostDetailResult;
import com.coliving.admin.community.application.result.AdminPostListItemResult;
import com.coliving.common.comment.adapter.out.jpa.CommentEntity;
import com.coliving.common.comment.adapter.out.jpa.CommentJpaRepository;
import com.coliving.common.community.adapter.out.jpa.PostEntity;
import com.coliving.common.community.adapter.out.jpa.PostJpaRepository;
import com.coliving.common.community.model.PostAttachment;
import com.coliving.common.community.model.PostLink;
import com.coliving.global.html.PlainTextHtmlSanitizer;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class AdminCommunityPersistenceAdapter implements AdminCommunityRepositoryPort {
    private final PostJpaRepository postJpaRepository;
    private final CommentJpaRepository commentJpaRepository;
    private final ObjectMapper objectMapper;

    public AdminCommunityPersistenceAdapter(PostJpaRepository postJpaRepository,
                                            CommentJpaRepository commentJpaRepository,
                                            ObjectMapper objectMapper) {
        this.postJpaRepository = postJpaRepository;
        this.commentJpaRepository = commentJpaRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public Page<AdminPostListItemResult> findPosts(String category,
                                                   Long authorUserId,
                                                   String keyword,
                                                   OffsetDateTime createdFrom,
                                                   OffsetDateTime createdTo,
                                                   Pageable pageable) {
        Specification<PostEntity> spec = Specification.where(null);
        if (category != null && !category.isBlank()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category"), category.trim().toUpperCase()));
        }
        if (authorUserId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("userId"), authorUserId));
        }
        if (keyword != null && !keyword.isBlank()) {
            String pattern = "%" + keyword.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("content")), pattern)
            ));
        }
        if (createdFrom != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), createdFrom));
        }
        if (createdTo != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), createdTo));
        }

        return postJpaRepository.findAll(spec, pageable).map(this::toPostListItem);
    }

    @Override
    public Optional<AdminPostDetailResult> findPostDetail(Long postId) {
        return postJpaRepository.findById(postId).map(this::toPostDetail);
    }

    @Override
    public Page<AdminCommentListItemResult> findComments(Long postId,
                                                         Long authorUserId,
                                                         OffsetDateTime createdFrom,
                                                         OffsetDateTime createdTo,
                                                         Pageable pageable) {
        Specification<CommentEntity> spec = Specification.where(null);
        if (postId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("post").get("postId"), postId));
        }
        if (authorUserId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("userId"), authorUserId));
        }
        if (createdFrom != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("createdAt"), createdFrom));
        }
        if (createdTo != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("createdAt"), createdTo));
        }

        Page<CommentEntity> page = commentJpaRepository.findAll(spec, pageable);
        Map<Long, String> postTitleMap = buildPostTitleMap(page.getContent());
        return page.map(entity -> toCommentListItem(entity, postTitleMap));
    }

    @Override
    public Optional<AdminCommentDetailResult> findCommentDetail(Long commentId) {
        return commentJpaRepository.findById(commentId).map(this::toCommentDetail);
    }

    private AdminPostListItemResult toPostListItem(PostEntity entity) {
        return AdminPostListItemResult.builder()
                .postId(entity.getPostId())
                .category(entity.getCategory())
                .title(PlainTextHtmlSanitizer.sanitizeTitle(entity.getTitle()))
                .authorUserId(entity.getUserId())
                .viewCount(entity.getViewCount())
                .likeCount(entity.getLikeCount())
                .commentCount(entity.getCommentCount())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private AdminPostDetailResult toPostDetail(PostEntity entity) {
        return AdminPostDetailResult.builder()
                .postId(entity.getPostId())
                .category(entity.getCategory())
                .title(PlainTextHtmlSanitizer.sanitizeTitle(entity.getTitle()))
                .content(entity.getContent())
                .authorUserId(entity.getUserId())
                .attachments(parseAttachments(entity))
                .links(parseLinks(entity))
                .viewCount(entity.getViewCount())
                .likeCount(entity.getLikeCount())
                .commentCount(entity.getCommentCount())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private AdminCommentListItemResult toCommentListItem(CommentEntity entity, Map<Long, String> postTitleMap) {
        Long postId = entity.getPostId();
        String postTitle = postId == null ? "" : postTitleMap.getOrDefault(postId, "");
        return AdminCommentListItemResult.builder()
                .commentId(entity.getCommentId())
                .postId(postId)
                .postTitle(postTitle)
                .authorUserId(entity.getUserId())
                .content(PlainTextHtmlSanitizer.stripToPlain(entity.getContent()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private AdminCommentDetailResult toCommentDetail(CommentEntity entity) {
        String postTitle = "";
        if (entity.getPost() != null && entity.getPost().getTitle() != null) {
            postTitle = PlainTextHtmlSanitizer.sanitizeTitle(entity.getPost().getTitle());
        }
        return AdminCommentDetailResult.builder()
                .commentId(entity.getCommentId())
                .postId(entity.getPostId())
                .postTitle(postTitle)
                .authorUserId(entity.getUserId())
                .content(entity.getContent())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private List<PostAttachment> parseAttachments(PostEntity entity) {
        try {
            return objectMapper.convertValue(entity.getAttachments(), new TypeReference<>() {
            });
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    private List<PostLink> parseLinks(PostEntity entity) {
        try {
            return objectMapper.convertValue(entity.getLinks(), new TypeReference<>() {
            });
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }

    private Map<Long, String> buildPostTitleMap(List<CommentEntity> comments) {
        Set<Long> postIds = comments.stream()
                .map(CommentEntity::getPostId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());
        if (postIds.isEmpty()) {
            return Map.of();
        }

        List<PostEntity> posts = postJpaRepository.findAllById(postIds);
        Map<Long, String> map = new HashMap<>();
        for (PostEntity post : posts) {
            map.put(post.getPostId(), PlainTextHtmlSanitizer.sanitizeTitle(post.getTitle()));
        }
        return map;
    }
}
