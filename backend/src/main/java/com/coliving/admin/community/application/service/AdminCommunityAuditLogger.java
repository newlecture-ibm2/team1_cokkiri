package com.coliving.admin.community.application.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class AdminCommunityAuditLogger {
    private static final Logger log = LoggerFactory.getLogger("AUDIT_ADMIN_COMMUNITY");

    public void logDeletePost(Long actorUserId, Long postId) {
        log.info("action=DELETE_POST actorUserId={} targetPostId={}", actorUserId, postId);
    }

    public void logDeleteComment(Long actorUserId, Long commentId) {
        log.info("action=DELETE_COMMENT actorUserId={} targetCommentId={}", actorUserId, commentId);
    }
}
