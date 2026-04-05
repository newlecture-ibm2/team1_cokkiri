package com.coliving.admin.device.adapter.out.jpa;

import com.coliving.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(
        name = "device_types",
        uniqueConstraints = {@UniqueConstraint(columnNames = "code")}
)
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DeviceTypeEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "device_type_id")
    private Long deviceTypeId;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "commands", columnDefinition = "jsonb")
    private String commands;

    @Column(name = "ui_type", length = 30)
    private String uiType;

    @Column(name = "is_system_default", nullable = false)
    private Boolean isSystemDefault = false;

    @Builder
    public DeviceTypeEntity(String code, String name, String commands, String uiType, Boolean isSystemDefault) {
        this.code = code;
        this.name = name;
        this.commands = commands;
        this.uiType = uiType;
        this.isSystemDefault = isSystemDefault != null ? isSystemDefault : false;
    }
}
