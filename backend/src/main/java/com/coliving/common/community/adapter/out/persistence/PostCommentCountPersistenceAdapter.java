package com.coliving.common.community.adapter.out.persistence;

import com.coliving.common.comment.application.port.out.PostCommentCountPort;
import com.coliving.common.community.adapter.out.jpa.PostEntity;
import com.coliving.common.community.adapter.out.jpa.PostJpaRepository;
import org.springframework.stereotype.Component;

import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;

@Component
public class PostCommentCountPersistenceAdapter implements PostCommentCountPort {

    private final PostJpaRepository postJpaRepository;

    public PostCommentCountPersistenceAdapter(PostJpaRepository postJpaRepository) {
        this.postJpaRepository = postJpaRepository;
    }

    @Override
    public void incrementCommentCount(Long postId) {
        PostEntity entity = postJpaRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        entity.increaseCommentCount();
        postJpaRepository.save(entity);
    }

    @Override
    public void decrementCommentCount(Long postId) {
        PostEntity entity = postJpaRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        entity.decreaseCommentCount();
        postJpaRepository.save(entity);
    }

    @Override
    public void resetCommentCountToZero(Long postId) {
        PostEntity entity = postJpaRepository.findById(postId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));
        entity.setCommentCount(0);
        postJpaRepository.save(entity);
    }
}

