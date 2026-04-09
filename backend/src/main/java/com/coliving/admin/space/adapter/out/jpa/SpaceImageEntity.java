package com.coliving.admin.space.adapter.out.jpa;

import com.coliving.global.entity.BaseEntity;
import com.coliving.admin.space.model.ImageType;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.SQLDelete;

@Entity
@Table(name = "space_images")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SQLDelete(sql = "UPDATE space_images SET deleted_at = CURRENT_TIMESTAMP WHERE space_image_id = ?")
@SQLRestriction("deleted_at IS NULL")
public class SpaceImageEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "space_image_id")
    private Long spaceImageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "space_id", nullable = false)
    private SpaceEntity space;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "image_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private ImageType imageType;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "is_thumbnail")
    private Boolean isThumbnail;

    @Builder
    public SpaceImageEntity(SpaceEntity space, String imageUrl, ImageType imageType,
                             Integer sortOrder, Boolean isThumbnail) {
        this.space = space;
        this.imageUrl = imageUrl;
        this.imageType = imageType;
        this.sortOrder = sortOrder;
        this.isThumbnail = isThumbnail;
    }

    public void clearThumbnail() {
        this.isThumbnail = false;
    }
}
