package com.coliving.common.comment.adapter.out.persistence;

import com.coliving.common.comment.adapter.out.jpa.CommentEntity;
import com.coliving.common.comment.adapter.out.jpa.CommentJpaRepository;
import com.coliving.common.comment.application.port.out.CommentRepositoryPort;
import com.coliving.common.comment.application.port.out.PostCommentCountPort;
import com.coliving.common.community.adapter.out.jpa.PostJpaRepository;
import com.coliving.common.community.model.Comment;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
public class CommentPersistenceAdapter implements CommentRepositoryPort {

    private final CommentJpaRepository commentJpaRepository;
    private final PostJpaRepository postJpaRepository;
    private final PostCommentCountPort postCommentCountPort;

    public CommentPersistenceAdapter(CommentJpaRepository commentJpaRepository,
                                     PostJpaRepository postJpaRepository,
                                     PostCommentCountPort postCommentCountPort) {
        this.commentJpaRepository = commentJpaRepository;
        this.postJpaRepository = postJpaRepository;
        this.postCommentCountPort = postCommentCountPort;
    }

    @Override
    public List<Comment> findCommentsByPostId(Long postId, Sort sort) {
        return commentJpaRepository.findByPost_PostId(postId, sort).stream()
                .map(this::mapCommentEntityToModel)
                .toList();
    }

    @Override
    public Optional<Comment> findCommentById(Long commentId) {
        return commentJpaRepository.findByCommentId(commentId)
                .map(this::mapCommentEntityToModel);
    }

    @Override
    public Comment createComment(Long postId, Long userId, String content) {
        // post 존재 여부 검증은 commentCount port에서 같은 규칙으로 수행됩니다.

        CommentEntity entity = new CommentEntity();
        entity.setPost(postJpaRepository.getReferenceById(postId));
        entity.setUserId(userId);
        entity.setContent(content);
        entity = commentJpaRepository.save(entity);

        postCommentCountPort.incrementCommentCount(postId);

        return mapCommentEntityToModel(entity);
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

        postCommentCountPort.decrementCommentCount(postId);
    }

    @Override
    public void softDeleteCommentsByPostId(Long postId) {
        // post.commentCount 조정은 community(포스트) 삭제 로직에서 처리한다.
        List<CommentEntity> comments = commentJpaRepository.findByPost_PostId(postId);
        for (CommentEntity comment : comments) {
            comment.softDelete();
        }
        commentJpaRepository.saveAll(comments);
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
}

