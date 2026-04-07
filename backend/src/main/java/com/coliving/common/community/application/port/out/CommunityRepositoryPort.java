package com.coliving.common.community.application.port.out;

import com.coliving.common.community.model.Comment;
import com.coliving.common.community.model.Post;
import com.coliving.common.community.model.PostAttachment;
import com.coliving.common.community.model.PostCategory;
import com.coliving.common.community.model.PostLink;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Optional;

public interface CommunityRepositoryPort {

    Page<Post> findPosts(PostCategory category, Pageable pageable);

    Optional<Post> findPostById(Long postId);

    List<Comment> findCommentsByPostId(Long postId, Sort sort);

    boolean isLikedByMe(Long postId, Long userId);

    Post toggleLike(Long postId, Long userId);

    Post createPost(Long userId,
                     PostCategory category,
                     String title,
                     String content,
                     List<PostAttachment> attachments,
                     List<PostLink> links);

    Post updatePost(Long postId,
                     PostCategory category,
                     String title,
                     String content,
                     List<PostAttachment> attachments,
                     List<PostLink> links);

    void softDeletePost(Long postId);

    Post incrementViewCount(Long postId);

    Comment createComment(Long postId, Long userId, Long parentCommentId, String content);

    Optional<Comment> findCommentById(Long commentId);

    Comment updateComment(Long commentId, String content);

    void softDeleteComment(Long commentId);
}

