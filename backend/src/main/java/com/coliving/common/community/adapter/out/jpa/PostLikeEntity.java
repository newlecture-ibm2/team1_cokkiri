package com.coliving.common.community.adapter.out.jpa;

import com.coliving.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import org.hibernate.annotations.BatchSize;
import org.hibernate.annotations.SQLRestriction;

@Getter
@Entity
@Table(name = "post_likes")
@BatchSize(size = 16)
@SQLRestriction("deleted_at IS NULL")
public class PostLikeEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_like_id")
    private Long postLikeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private PostEntity post;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    public Long getPostId() {
        return post == null ? null : post.getPostId();
    }

    public void setPost(PostEntity post) {
        this.post = post;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}
