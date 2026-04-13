package com.coliving.common.community.application.service;

import com.coliving.common.community.adapter.out.cache.CommunityLikeActionGuard;
import com.coliving.common.community.application.command.*;
import com.coliving.common.community.application.port.in.CommunityUseCase;
import com.coliving.common.community.application.port.out.CommunityRepositoryPort;
import com.coliving.common.community.application.result.*;
import com.coliving.common.community.model.ActorRole;
import com.coliving.common.community.model.Post;
import com.coliving.common.community.model.PostAttachment;
import com.coliving.common.community.model.PostCategory;
import com.coliving.common.comment.application.event.CommentPostedEvent;
import com.coliving.common.community.model.Comment;
import com.coliving.common.notification.application.command.CreateNotificationCommand;
import com.coliving.common.notification.application.port.in.CreateNotificationUseCase;
import com.coliving.common.notification.model.NotificationType;
import com.coliving.common.notification.model.ReferenceType;
import com.coliving.admin.user.application.port.out.AdminUserRepositoryPort;
import com.coliving.admin.user.application.result.AdminUserResult;
import com.coliving.common.auth.model.UserRole;
import com.coliving.common.auth.model.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import com.coliving.global.attachment.RetainedAttachmentResolver;
import com.coliving.global.html.PlainTextHtmlSanitizer;
import com.coliving.global.html.PostBodyHtmlPathNormalizer;
import com.coliving.global.html.PostBodyHtmlSanitizer;
import com.coliving.global.validation.PlainTextFieldValidation;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Set;
import java.util.List;

@Slf4j
@Service
public class CommunityService implements CommunityUseCase {
    private static final Set<String> ALLOWED_SORT_PROPERTIES = Set.of(
            "createdAt", "updatedAt", "viewCount", "likeCount", "commentCount");

    private final CommunityRepositoryPort repositoryPort;
    private final CommunityLikeActionGuard likeActionGuard;
    private final CreateNotificationUseCase createNotificationUseCase;
    private final AdminUserRepositoryPort adminUserRepositoryPort;
    private final ApplicationEventPublisher eventPublisher;

    public CommunityService(CommunityRepositoryPort repositoryPort,
            CommunityLikeActionGuard likeActionGuard,
            CreateNotificationUseCase createNotificationUseCase,
            AdminUserRepositoryPort adminUserRepositoryPort,
            ApplicationEventPublisher eventPublisher) {
        this.repositoryPort = repositoryPort;
        this.likeActionGuard = likeActionGuard;
        this.createNotificationUseCase = createNotificationUseCase;
        this.adminUserRepositoryPort = adminUserRepositoryPort;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional(readOnly = true)
    public PostListResult getPostList(GetPostListCommand command) {
        int safePage = Math.max(0, command.getPage());
        int safeSize = normalizeSize(command.getSize());
        PageRequest pageRequest;
        if (command.getCategory() == null) {
            // 전체 목록: NOTICE 우선 정렬은 저장소 쿼리에서 처리. Pageable Sort는 비워야 ORDER BY가 충돌하지 않음.
            pageRequest = PageRequest.of(safePage, safeSize, Sort.unsorted());
        } else {
            pageRequest = PageRequest.of(safePage, safeSize, parseSort(command.getSort()));
        }

        Page<Post> page = repositoryPort.findPosts(command.getCategory(), pageRequest);

        List<PostListItemResult> content = page.getContent().stream()
                .map(post -> {
                    String authorName;
                    try {
                        AdminUserResult user = adminUserRepositoryPort.findUserById(post.getUserId());
                        authorName = user.getName();
                    } catch (Exception e) {
                        authorName = "알 수 없음";
                    }
                    return PostListItemResult.builder()
                            .postId(post.getPostId())
                            .category(post.getCategory())
                            .title(PlainTextHtmlSanitizer.sanitizeTitle(post.getTitle()))
                            .authorUserId(post.getUserId())
                            .authorName(authorName)
                            .viewCount(post.getViewCount())
                            .likeCount(post.getLikeCount())
                            .commentCount(post.getCommentCount())
                            .createdAt(post.getCreatedAt())
                            .build();
                })
                .toList();

        return PostListResult.builder()
                .content(content)
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PostDetailResult getPostDetail(GetPostDetailCommand command) {
        Post post = repositoryPort.incrementViewCount(command.getPostId());

        Sort commentSort = Sort.by(Sort.Direction.ASC, "createdAt");
        List<Comment> comments = repositoryPort.findCommentsByPostId(command.getPostId(), commentSort);

        boolean likedByMe = command.getActorId() != null
                && repositoryPort.isLikedByMe(command.getPostId(), command.getActorId());

        return PostDetailResult.builder()
                .postId(post.getPostId())
                .category(post.getCategory())
                .title(PlainTextHtmlSanitizer.sanitizeTitle(post.getTitle()))
                .content(PostBodyHtmlSanitizer.sanitize(post.getContent()))
                .attachments(post.getAttachments())
                .links(post.getLinks())
                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .likedByMe(likedByMe)
                .authorUserId(post.getUserId())
                .comments(comments)
                .createdAt(post.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public CreatePostResult createPost(CreatePostCommand command) {
        if (command.getCategory() == PostCategory.NOTICE && command.getActorRole() != ActorRole.ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        Post post = repositoryPort.createPost(
                command.getActorId(),
                command.getCategory(),
                PlainTextFieldValidation.requireNonBlankTitleForSave(command.getTitle()),
                PostBodyHtmlSanitizer.sanitize(command.getContent()),
                command.getAttachments(),
                command.getLinks());

        CreatePostResult result = CreatePostResult.builder()
                .postId(post.getPostId())
                .createdAt(post.getCreatedAt())
                .build();

        if (post.getCategory() == PostCategory.NOTICE) {
            notifyAllResidentsOfNotice(post, "새로운 공지사항이 등록되었습니다");
        }

        return result;
    }

    private void notifyAllResidentsOfNotice(Post post, String title) {
        if (post == null) return;

        // 대량 알림(팬아웃)은 비동기 리스너로 위임
        eventPublisher.publishEvent(com.coliving.common.community.application.event.NoticePublishedEvent.builder()
                .postId(post.getPostId())
                .title(post.getTitle())
                .build());
    }

    @Override
    @Transactional
    public UpdatePostResult updatePost(UpdatePostCommand command) {
        Post post = repositoryPort.findPostById(command.getPostId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (command.getActorRole() != ActorRole.ADMIN && !post.getUserId().equals(command.getActorId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        if (post.getCategory() == PostCategory.NOTICE && command.getActorRole() != ActorRole.ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        if (command.getCategory() == PostCategory.NOTICE && command.getActorRole() != ActorRole.ADMIN) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        List<PostAttachment> base;
        if (command.getRetainedAttachments() != null) {
            base = RetainedAttachmentResolver.resolve(
                    post.getAttachments(),
                    command.getRetainedAttachments(),
                    PostAttachment::getFileUrl,
                    PostBodyHtmlPathNormalizer::normalizeAttachmentUrlForMatch);
        } else {
            base = post.getAttachments() == null
                    ? new ArrayList<>()
                    : new ArrayList<>(post.getAttachments());
        }
        if (command.getNewFileAttachments() != null && !command.getNewFileAttachments().isEmpty()) {
            base.addAll(command.getNewFileAttachments());
        }

        Post updated = repositoryPort.updatePost(
                command.getPostId(),
                command.getCategory(),
                PlainTextFieldValidation.requireNonBlankTitleForSave(command.getTitle()),
                PostBodyHtmlSanitizer.sanitize(command.getContent()),
                base,
                command.getLinks());

        UpdatePostResult result = UpdatePostResult.builder()
                .postId(updated.getPostId())
                .updatedAt(updated.getUpdatedAt())
                .build();

        if (updated.getCategory() == PostCategory.NOTICE) {
            notifyAllResidentsOfNotice(updated, "공지사항이 수정되었습니다");
        }

        return result;
    }

    @Override
    @Transactional
    public DeletePostResult deletePost(DeletePostCommand command) {
        Post post = repositoryPort.findPostById(command.getPostId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (command.getActorRole() != ActorRole.ADMIN && !post.getUserId().equals(command.getActorId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        repositoryPort.softDeletePost(command.getPostId());

        return DeletePostResult.builder()
                .postId(command.getPostId())
                .build();
    }

    @Override
    @Transactional
    public ToggleLikeResult toggleLike(TogglePostLikeCommand command) {
        try (CommunityLikeActionGuard.LockHandle ignored = likeActionGuard.acquire(command.getPostId(),
                command.getActorId())) {
            Post after = repositoryPort.toggleLike(command.getPostId(), command.getActorId());
            boolean likedByMe = repositoryPort.isLikedByMe(command.getPostId(), command.getActorId());

            return ToggleLikeResult.builder()
                    .postId(after.getPostId())
                    .liked(likedByMe)
                    .likeCount(after.getLikeCount())
                    .build();
        }
    }

    @Override
    @Transactional
    public CommentResult createComment(CreateCommentCommand command) {
        Comment created = repositoryPort.createComment(
                command.getPostId(),
                command.getActorId(),
                command.getParentCommentId(),
                command.getContent());

        CommentResult result = CommentResult.builder()
                .commentId(created.getCommentId())
                .postId(created.getPostId())
                .createdAt(created.getCreatedAt())
                .build();

        eventPublisher.publishEvent(new CommentPostedEvent(
                command.getPostId(),
                command.getActorId(),
                command.getParentCommentId()));

        return result;
    }

    @Override
    @Transactional
    public CommentResult updateComment(UpdateCommentCommand command) {
        Comment comment = repositoryPort.findCommentById(command.getCommentId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (command.getActorRole() != ActorRole.ADMIN && !comment.getUserId().equals(command.getActorId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        Comment updated = repositoryPort.updateComment(command.getCommentId(), command.getContent());

        return CommentResult.builder()
                .commentId(updated.getCommentId())
                .postId(updated.getPostId())
                .createdAt(updated.getCreatedAt())
                .build();
    }

    @Override
    @Transactional
    public CommentResult deleteComment(DeleteCommentCommand command) {
        Comment comment = repositoryPort.findCommentById(command.getCommentId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        if (command.getActorRole() != ActorRole.ADMIN && !comment.getUserId().equals(command.getActorId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        repositoryPort.softDeleteComment(command.getCommentId());

        return CommentResult.builder()
                .commentId(comment.getCommentId())
                .postId(comment.getPostId())
                .createdAt(comment.getCreatedAt())
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
