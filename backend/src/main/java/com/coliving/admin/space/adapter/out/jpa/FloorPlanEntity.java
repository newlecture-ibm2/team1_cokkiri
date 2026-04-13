package com.coliving.admin.space.adapter.out.jpa;

import com.coliving.admin.space.model.FloorAnnotation;
import com.coliving.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "floor_plans", uniqueConstraints = {
        @UniqueConstraint(columnNames = "floor")
})
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class FloorPlanEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "floor_plan_id")
    private Long floorPlanId;

    @Column(name = "floor", nullable = false, unique = true)
    private Integer floor;

    @Column(name = "blueprint_url")
    private String blueprintUrl;

    @Builder.Default
    @Column(name = "blueprint_opacity", precision = 3, scale = 2)
    private BigDecimal blueprintOpacity = new BigDecimal("0.30");

    @Builder.Default
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "annotations", columnDefinition = "jsonb")
    private List<FloorAnnotation> annotations = new ArrayList<>();

    // ── 도메인 행위 ──

    public void updateBlueprint(String blueprintUrl) {
        this.blueprintUrl = blueprintUrl;
    }

    public void removeBlueprint() {
        this.blueprintUrl = null;
    }

    public void updatePlan(BigDecimal blueprintOpacity, List<FloorAnnotation> annotations) {
        if (blueprintOpacity != null) {
            this.blueprintOpacity = blueprintOpacity;
        }
        if (annotations != null) {
            this.annotations = annotations;
        }
    }
}
