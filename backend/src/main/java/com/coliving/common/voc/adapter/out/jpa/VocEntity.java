package com.coliving.common.voc.adapter.out.jpa;

import com.coliving.common.voc.model.VocCategory;
import com.coliving.common.voc.model.VocStatus;
import com.coliving.global.entity.BaseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;

@Getter
@Entity
@Table(name = "voc")
@SQLRestriction("deleted_at IS NULL")
public class VocEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "voc_id")
    private Long vocId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 20)
    private VocCategory category;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "attachments", columnDefinition = "jsonb")
    private JsonNode attachments;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    private VocStatus status = VocStatus.OPEN;

    @Column(name = "admin_reply", columnDefinition = "TEXT")
    private String adminReply;

    @Column(name = "reply_user_id")
    private Long replyUserId;

    @Column(name = "replied_at")
    private OffsetDateTime repliedAt;

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setCategory(VocCategory category) {
        this.category = category;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setAttachments(JsonNode attachments) {
        this.attachments = attachments;
    }

    public void setStatus(VocStatus status) {
        this.status = status;
    }

    public void setAdminReply(String adminReply) {
        this.adminReply = adminReply;
    }

    public void setReplyUserId(Long replyUserId) {
        this.replyUserId = replyUserId;
    }

    public void setRepliedAt(OffsetDateTime repliedAt) {
        this.repliedAt = repliedAt;
    }
}
