import os

base_dir = r"c:\RealProject\ibm_cokkiri\backend\src\main\java\com\coliving\common\community"

files = {
    "model/Post.java": """package com.coliving.common.community.model;

import lombok.Builder;
import lombok.Getter;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Builder
public class Post {
    private Long postId;
    private Long userId;
    private String category;
    private String title;
    private String content;
    private List<Map<String, Object>> attachments;
    private List<Map<String, Object>> links;
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime deletedAt;
}
""",
    "model/Comment.java": """package com.coliving.common.community.model;

import lombok.Builder;
import lombok.Getter;
import java.time.OffsetDateTime;

@Getter
@Builder
public class Comment {
    private Long commentId;
    private Long postId;
    private Long userId;
    private String content;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime deletedAt;
}
""",
    "model/PostLike.java": """package com.coliving.common.community.model;

import lombok.Builder;
import lombok.Getter;
import java.time.OffsetDateTime;

@Getter
@Builder
public class PostLike {
    private Long postLikeId;
    private Long postId;
    private Long userId;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private OffsetDateTime deletedAt;
}
""",
    "adapter/out/jpa/PostEntity.java": """package com.coliving.common.community.adapter.out.jpa;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import com.coliving.global.entity.BaseEntity;

import java.util.List;
import java.util.Map;

@Entity
@Table(name = "POST")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PostEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long postId;

    private Long userId;
    private String category;
    private String title;
    private String content;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<Map<String, Object>> attachments;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private List<Map<String, Object>> links;

    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;

    @Builder
    public PostEntity(Long userId, String category, String title, String content, List<Map<String, Object>> attachments, List<Map<String, Object>> links, Integer viewCount, Integer likeCount, Integer commentCount) {
        this.userId = userId;
        this.category = category;
        this.title = title;
        this.content = content;
        this.attachments = attachments;
        this.links = links;
        this.viewCount = viewCount;
        this.likeCount = likeCount;
        this.commentCount = commentCount;
    }
}
""",
    "adapter/out/jpa/CommentEntity.java": """package com.coliving.common.community.adapter.out.jpa;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import com.coliving.global.entity.BaseEntity;

@Entity
@Table(name = "COMMENT")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CommentEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long commentId;

    private Long postId;
    private Long userId;
    private String content;

    @Builder
    public CommentEntity(Long postId, Long userId, String content) {
        this.postId = postId;
        this.userId = userId;
        this.content = content;
    }
}
""",
    "adapter/out/jpa/PostLikeEntity.java": """package com.coliving.common.community.adapter.out.jpa;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import com.coliving.global.entity.BaseEntity;

@Entity
@Table(name = "POST_LIKE")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PostLikeEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long postLikeId;

    private Long postId;
    private Long userId;

    @Builder
    public PostLikeEntity(Long postId, Long userId) {
        this.postId = postId;
        this.userId = userId;
    }
}
""",
    "adapter/out/jpa/PostJpaRepository.java": """package com.coliving.common.community.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostJpaRepository extends JpaRepository<PostEntity, Long> {
}
""",
    "adapter/out/jpa/CommentJpaRepository.java": """package com.coliving.common.community.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentJpaRepository extends JpaRepository<CommentEntity, Long> {
    List<CommentEntity> findAllByPostId(Long postId);
}
""",
    "adapter/out/jpa/PostLikeJpaRepository.java": """package com.coliving.common.community.adapter.out.jpa;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostLikeJpaRepository extends JpaRepository<PostLikeEntity, Long> {
    Optional<PostLikeEntity> findByPostIdAndUserId(Long postId, Long userId);
}
""",
    "application/port/out/CommunityRepositoryPort.java": """package com.coliving.common.community.application.port.out;

import com.coliving.common.community.model.Comment;
import com.coliving.common.community.model.Post;
import com.coliving.common.community.model.PostLike;

import java.util.List;
import java.util.Optional;

public interface CommunityRepositoryPort {
    Post savePost(Post post);
    Optional<Post> findPostById(Long postId);
    List<Post> findAllPosts();
    void deletePost(Long postId);

    Comment saveComment(Comment comment);
    List<Comment> findCommentsByPostId(Long postId);
    Optional<Comment> findCommentById(Long commentId);
    void deleteComment(Long commentId);

    PostLike savePostLike(PostLike postLike);
    Optional<PostLike> findPostLike(Long postId, Long userId);
    void deletePostLike(Long postLikeId);
}
""",
    "adapter/out/persistence/CommunityPersistenceAdapter.java": """package com.coliving.common.community.adapter.out.persistence;

import com.coliving.common.community.adapter.out.jpa.*;
import com.coliving.common.community.application.port.out.CommunityRepositoryPort;
import com.coliving.common.community.model.Comment;
import com.coliving.common.community.model.Post;
import com.coliving.common.community.model.PostLike;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CommunityPersistenceAdapter implements CommunityRepositoryPort {

    private final PostJpaRepository postJpaRepository;
    private final CommentJpaRepository commentJpaRepository;
    private final PostLikeJpaRepository postLikeJpaRepository;

    @Override
    public Post savePost(Post post) {
        PostEntity entity = PostEntity.builder()
                .userId(post.getUserId())
                .category(post.getCategory())
                .title(post.getTitle())
                .content(post.getContent())
                .attachments(post.getAttachments())
                .links(post.getLinks())
                .viewCount(post.getViewCount() != null ? post.getViewCount() : 0)
                .likeCount(post.getLikeCount() != null ? post.getLikeCount() : 0)
                .commentCount(post.getCommentCount() != null ? post.getCommentCount() : 0)
                .build();
        return toModel(postJpaRepository.save(entity));
    }

    @Override
    public Optional<Post> findPostById(Long postId) {
        return postJpaRepository.findById(postId).map(this::toModel);
    }

    @Override
    public List<Post> findAllPosts() {
        return postJpaRepository.findAll().stream().map(this::toModel).collect(Collectors.toList());
    }

    @Override
    public void deletePost(Long postId) {
        postJpaRepository.deleteById(postId);
    }

    @Override
    public Comment saveComment(Comment comment) {
        CommentEntity entity = CommentEntity.builder()
                .postId(comment.getPostId())
                .userId(comment.getUserId())
                .content(comment.getContent())
                .build();
        return toModel(commentJpaRepository.save(entity));
    }

    @Override
    public List<Comment> findCommentsByPostId(Long postId) {
        return commentJpaRepository.findAllByPostId(postId).stream().map(this::toModel).collect(Collectors.toList());
    }

    @Override
    public Optional<Comment> findCommentById(Long commentId) {
        return commentJpaRepository.findById(commentId).map(this::toModel);
    }

    @Override
    public void deleteComment(Long commentId) {
        commentJpaRepository.deleteById(commentId);
    }

    @Override
    public PostLike savePostLike(PostLike postLike) {
        PostLikeEntity entity = PostLikeEntity.builder()
                .postId(postLike.getPostId())
                .userId(postLike.getUserId())
                .build();
        return toModel(postLikeJpaRepository.save(entity));
    }

    @Override
    public Optional<PostLike> findPostLike(Long postId, Long userId) {
        return postLikeJpaRepository.findByPostIdAndUserId(postId, userId).map(this::toModel);
    }

    @Override
    public void deletePostLike(Long postLikeId) {
        postLikeJpaRepository.deleteById(postLikeId);
    }

    private Post toModel(PostEntity entity) {
        return Post.builder()
                .postId(entity.getPostId())
                .userId(entity.getUserId())
                .category(entity.getCategory())
                .title(entity.getTitle())
                .content(entity.getContent())
                .attachments(entity.getAttachments())
                .links(entity.getLinks())
                .viewCount(entity.getViewCount())
                .likeCount(entity.getLikeCount())
                .commentCount(entity.getCommentCount())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .deletedAt(entity.getDeletedAt())
                .build();
    }

    private Comment toModel(CommentEntity entity) {
        return Comment.builder()
                .commentId(entity.getCommentId())
                .postId(entity.getPostId())
                .userId(entity.getUserId())
                .content(entity.getContent())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .deletedAt(entity.getDeletedAt())
                .build();
    }

    private PostLike toModel(PostLikeEntity entity) {
        return PostLike.builder()
                .postLikeId(entity.getPostLikeId())
                .postId(entity.getPostId())
                .userId(entity.getUserId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .deletedAt(entity.getDeletedAt())
                .build();
    }
}
"""
}

for rel_path, content in files.items():
    full_path = os.path.join(base_dir, rel_path.replace("/", os.sep))
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Files generated successfully.")
