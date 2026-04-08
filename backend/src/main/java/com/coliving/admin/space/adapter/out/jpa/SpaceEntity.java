package com.coliving.admin.space.adapter.out.jpa;

import com.coliving.global.entity.BaseEntity;
import com.coliving.admin.space.model.SpaceStatus;
import com.coliving.admin.space.model.SpaceType;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.Formula;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "spaces")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SQLRestriction("deleted_at IS NULL")
public class SpaceEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "space_id")
    private Long spaceId;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private SpaceType type;

    @Column(name = "status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private SpaceStatus status;

    @Column(name = "floor")
    private Integer floor;

    @Column(name = "area", precision = 10, scale = 2)
    private BigDecimal area;

    @Column(name = "amenities", columnDefinition = "TEXT")
    private String amenities;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "position_x")
    private Integer positionX;

    @Column(name = "position_y")
    private Integer positionY;

    @Formula("(EXISTS (SELECT 1 FROM devices d WHERE d.space_id = space_id AND d.status = 'ERROR' AND d.deleted_at IS NULL))")
    private Boolean hasDeviceError;

    @OneToOne(mappedBy = "space", cascade = CascadeType.ALL, orphanRemoval = true)
    private PrivateSpaceDetailEntity privateDetail;

    @OneToOne(mappedBy = "space", cascade = CascadeType.ALL, orphanRemoval = true)
    private CommonSpaceDetailEntity commonDetail;

    @OneToMany(mappedBy = "space", cascade = CascadeType.ALL)
    @OrderBy("sortOrder ASC")
    private List<SpaceImageEntity> images = new ArrayList<>();

    @Builder
    public SpaceEntity(String name, SpaceType type, SpaceStatus status,
                       Integer floor, BigDecimal area, String amenities,
                       String description, Integer positionX, Integer positionY) {
        this.name = name;
        this.type = type;
        this.status = status;
        this.floor = floor;
        this.area = area;
        this.amenities = amenities;
        this.description = description;
        this.positionX = positionX;
        this.positionY = positionY;
    }

    public void updateBasicInfo(String name, SpaceStatus status, Integer floor,
                                BigDecimal area, String amenities, String description) {
        this.name = name;
        this.status = status;
        this.floor = floor;
        this.area = area;
        this.amenities = amenities;
        this.description = description;
    }

    public void changeStatus(SpaceStatus status) {
        this.status = status;
    }

    public void updatePosition(Integer positionX, Integer positionY) {
        this.positionX = positionX;
        this.positionY = positionY;
    }

    public void assignPrivateDetail(PrivateSpaceDetailEntity detail) {
        this.privateDetail = detail;
    }

    public void assignCommonDetail(CommonSpaceDetailEntity detail) {
        this.commonDetail = detail;
    }

    public Boolean getHasDeviceError() {
        if (hasDeviceError == null) return false;
        return hasDeviceError;
    }
}
