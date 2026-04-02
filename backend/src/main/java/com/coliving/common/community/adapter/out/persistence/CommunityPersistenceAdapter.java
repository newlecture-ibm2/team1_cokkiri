package com.coliving.common.community.adapter.out.persistence;

import com.coliving.common.community.adapter.out.jpa.CommentEntity;
import com.coliving.common.community.adapter.out.jpa.CommentJpaRepository;
import com.coliving.common.community.adapter.out.jpa.PostEntity;
import com.coliving.common.community.adapter.out.jpa.PostJpaRepository;
import com.coliving.common.community.adapter.out.jpa.PostLikeEntity;
import com.coliving.common.community.adapter.out.jpa.PostLikeJpaRepository;
import com.coliving.common.community.application.port.out.CommunityRepositoryPort;
import com.coliving.common.community.model.Comment;
import com.coliving.common.community.model.Post;
import com.coliving.common.community.model.PostAttachment;
import com.coliving.common.community.model.PostCategory;
import com.coliving.common.community.model.PostLink;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
public class CommunityPersistenceAdapter implements CommunityRepositoryPort {

    private final PostJpaRepository postJpaRepository;
    private final PostLikeJpaRepository postLikeJpaRepository;
    private final CommentJpaRepository commentJpaRepository;
    private final ObjectMapper objectMapper;

    public CommunityPersistenceAdapter(PostJpaRepository postJpaRepository,
                                       PostLikeJpaRepository postLikeJpaRepository,
                                       CommentJpaRepository commentJpaRepository,
                                       ObjectMapper objectMapper) {
        this.postJpaRepository = postJpaRepository;
        this.postLikeJpaRepository = postLikeJpaRepository;
        this.commentJpaRepository = commentJpaRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public Page<Post> findPosts(PostCategory category, Pageable pageable) {
        if (category == null) {
            return postJpaRepository.findAll(pageable).map(this::mapPostEntityToModel);
        }
        return postJpaRepository.findByCategory(category.name(), pageable).map(this::mapPostEntityToModel);
    }

    @Override
    public Optional<Post> findPostById(Long postId) {
        return postJpaRepository.findById(postId).map(this::mapPostEntityToModel);
    }

    @Override
    public List<Comment> findCommentsByPostId(Long postId, Sort sort) {
        return commentJpaRepository.findByPostId(postId, sort).stream()
                .map(this::mapCommentEntityToModel)
                .toList();
    }

    @Override
    public boolean isLikedByMe(Long postId, Long userId) {
        return postLikeJpaRepository.findByPostIdAndUserId(postId, userId).isPresent();
    }

    @Override
    public Post toggleLike(Long postId, Long userId) {
        PostEntity postEntity = postJpaRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        Optional<PostLikeEntity> existingLike = postLikeJpaRepository.findByPostIdAndUserId(postId, userId);

        if (existingLike.isPresent()) {
            PostLikeEntity likeEntity = existingLike.get();
            likeEntity.softDelete();
            postLikeJpaRepository.save(likeEntity);

            postEntity.decreaseLikeCount();
            postJpaRepository.save(postEntity);
        } else {
            PostLikeEntity likeEntity = new PostLikeEntity();
            likeEntity.setPostId(postId);
            likeEntity.setUserId(userId);
            postLikeJpaRepository.save(likeEntity);

            postEntity.increaseLikeCount();
            postJpaRepository.save(postEntity);
        }

        return mapPostEntityToModel(postEntity);
    }

    @Override
    public Post createPost(Long userId,
                            PostCategory category,
                            String title,
                            String content,
                            List<PostAttachment> attachments,
                            List<PostLink> links) {
        PostEntity entity = new PostEntity();
        entity.setUserId(userId);
        entity.setCategory(category.name());
        entity.setTitle(title);
        entity.setContent(content);

        entity.setAttachments(toJsonArray(attachments));
        entity.setLinks(toJsonArray(links));

        entity = postJpaRepository.save(entity);
        return mapPostEntityToModel(entity);
    }

    @Override
    public Post updatePost(Long postId,
                            PostCategory category,
                            String title,
                            String content,
                            List<PostAttachment> attachments,
                            List<PostLink> links) {
        PostEntity entity = postJpaRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        entity.setCategory(category.name());
        entity.setTitle(title);
        entity.setContent(content);
        entity.setAttachments(toJsonArray(attachments));
        entity.setLinks(toJsonArray(links));

        entity = postJpaRepository.save(entity);
        return mapPostEntityToModel(entity);
    }

    @Override
    public void softDeletePost(Long postId) {
        PostEntity entity = postJpaRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        entity.softDelete();
        postJpaRepository.save(entity);
    }

    @Override
    public Post incrementViewCount(Long postId) {
        PostEntity entity = postJpaRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        entity.incrementViewCount();
        entity = postJpaRepository.save(entity);
        return mapPostEntityToModel(entity);
    }

    @Override
    public Comment createComment(Long postId, Long userId, String content) {
        PostEntity postEntity = postJpaRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        CommentEntity entity = new CommentEntity();
        entity.setPostId(postId);
        entity.setUserId(userId);
        entity.setContent(content);
        entity = commentJpaRepository.save(entity);

        postEntity.increaseCommentCount();
        postJpaRepository.save(postEntity);

        return mapCommentEntityToModel(entity);
    }

    @Override
    public Optional<Comment> findCommentById(Long commentId) {
        return commentJpaRepository.findByCommentId(commentId).map(this::mapCommentEntityToModel);
    }

    @Override
    public Comment updateComment(Long commentId, String content) {
        CommentEntity entity = commentJpaRepository.findByCommentId(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        entity.setContent(content);
        entity = commentJpaRepository.save(entity);
        return mapCommentEntityToModel(entity);
    }

    @Override
    public void softDeleteComment(Long commentId) {
        CommentEntity entity = commentJpaRepository.findByCommentId(commentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        Long postId = entity.getPostId();

        entity.softDelete();
        commentJpaRepository.save(entity);

        PostEntity postEntity = postJpaRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        postEntity.decreaseCommentCount();
        postJpaRepository.save(postEntity);
    }

    private Post mapPostEntityToModel(PostEntity entity) {
        List<PostAttachment> attachments = parseAttachments(entity.getAttachments());
        List<PostLink> links = parseLinks(entity.getLinks());

        return Post.builder()
                .postId(entity.getPostId())
                .userId(entity.getUserId())
                .category(PostCategory.valueOf(entity.getCategory()))
                .title(entity.getTitle())
                .content(entity.getContent())
                .attachments(attachments)
                .links(links)
                .viewCount(entity.getViewCount())
                .likeCount(entity.getLikeCount())
                .commentCount(entity.getCommentCount())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    private Comment mapCommentEntityToModel(CommentEntity entity) {
        return Comment.builder()
                .commentId(entity.getCommentId())
                .postId(entity.getPostId())
                .userId(entity.getUserId())
                .content(entity.getContent())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private JsonNode toJsonArray(List<?> items) {
        if (items == null) {
            return objectMapper.createArrayNode();
        }
        return objectMapper.valueToTree(items);
    }

    private List<PostAttachment> parseAttachments(JsonNode node) {
        if (node == null || !node.isArray()) {
            return Collections.emptyList();
        }

        List<PostAttachment> result = new java.util.ArrayList<>();
        for (JsonNode element : node) {
            if (element == null || element.isNull()) {
                continue;
            }
            String fileUrl = element.hasNonNull("fileUrl") ? element.get("fileUrl").asText() : null;
            String fileName = element.hasNonNull("fileName") ? element.get("fileName").asText() : null;
            Long fileSize = element.hasNonNull("fileSize") ? element.get("fileSize").asLong() : null;
            result.add(PostAttachment.builder()
                    .fileUrl(fileUrl)
                    .fileName(fileName)
                    .fileSize(fileSize)
                    .build());
        }
        return result;
    }

    private List<PostLink> parseLinks(JsonNode node) {
        if (node == null || !node.isArray()) {
            return Collections.emptyList();
        }

        List<PostLink> result = new java.util.ArrayList<>();
        for (JsonNode element : node) {
            if (element == null || element.isNull()) {
                continue;
            }
            String url = element.hasNonNull("url") ? element.get("url").asText() : null;
            result.add(PostLink.builder().url(url).build());
        }
        return result;
    }
}

