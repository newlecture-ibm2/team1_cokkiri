package com.coliving.admin.device.adapter.out.jpa;

import com.coliving.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.time.OffsetDateTime;

@Entity
@Table(name = "devices")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DeviceEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "device_id")
    private Long deviceId;

    @Column(name = "space_id", nullable = false)
    private Long spaceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_type_id", nullable = false)
    private DeviceTypeEntity deviceType;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "model_name", length = 100)
    private String modelName;

    @Column(name = "mac_address", length = 50)
    private String macAddress;

    @Column(name = "mock_endpoint", length = 255)
    private String mockEndpoint;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DeviceStatus status = DeviceStatus.OFFLINE;

    @Column(name = "current_state", columnDefinition = "jsonb")
    private String currentState;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "installed_at")
    private OffsetDateTime installedAt;

    @Column(name = "last_online_at")
    private OffsetDateTime lastOnlineAt;

    @Builder
    public DeviceEntity(Long spaceId, DeviceTypeEntity deviceType, String name,
                        String modelName, String macAddress, String mockEndpoint,
                        DeviceStatus status, String currentState,
                        Boolean isActive, OffsetDateTime installedAt) {
        this.spaceId = spaceId;
        this.deviceType = deviceType;
        this.name = name;
        this.modelName = modelName;
        this.macAddress = macAddress;
        this.mockEndpoint = mockEndpoint;
        this.status = status != null ? status : DeviceStatus.OFFLINE;
        this.currentState = currentState != null ? currentState : "{}";
        this.isActive = isActive != null ? isActive : true;
        this.installedAt = installedAt;
    }

    public void update(String name, String modelName, String macAddress,
                       String mockEndpoint, Long spaceId, DeviceTypeEntity deviceType) {
        this.name = name;
        this.modelName = modelName;
        this.macAddress = macAddress;
        this.mockEndpoint = mockEndpoint;
        this.spaceId = spaceId;
        this.deviceType = deviceType;
    }

    public void updateStatus(DeviceStatus status) {
        this.status = status;
        if (status == DeviceStatus.ONLINE) {
            this.lastOnlineAt = OffsetDateTime.now();
        }
    }

    public void updateActive(boolean isActive) {
        this.isActive = isActive;
    }
}
