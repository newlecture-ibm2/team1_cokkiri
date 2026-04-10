package com.coliving.admin.space.adapter.out.jpa;

import com.coliving.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "annotation_types")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SQLDelete(sql = "UPDATE annotation_types SET deleted_at = CURRENT_TIMESTAMP WHERE annotation_type_id = ?")
@SQLRestriction("deleted_at IS NULL")
public class AnnotationTypeEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "annotation_type_id")
    private Long id;

    @Column(name = "code", length = 50, unique = true, nullable = false)
    private String code;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "icon_name", length = 50, nullable = false)
    private String iconName;

    @Column(name = "default_color", length = 30, nullable = false)
    private String defaultColor;

    @Column(name = "is_system_default", nullable = false)
    private Boolean isSystemDefault;

    @Builder
    public AnnotationTypeEntity(String code, String name, String iconName, String defaultColor, Boolean isSystemDefault) {
        this.code = code;
        this.name = name;
        this.iconName = iconName;
        this.defaultColor = defaultColor;
        this.isSystemDefault = isSystemDefault;
    }

    public void update(String name, String iconName, String defaultColor) {
        this.name = name;
        this.iconName = iconName;
        this.defaultColor = defaultColor;
    }
}
