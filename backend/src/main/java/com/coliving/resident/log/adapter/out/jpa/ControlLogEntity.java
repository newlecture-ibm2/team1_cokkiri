package com.coliving.resident.log.adapter.out.jpa;

import com.coliving.global.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "control_logs")
@SQLDelete(sql = "UPDATE control_logs SET deleted_at = CURRENT_TIMESTAMP WHERE control_log_id = ?")
@SQLRestriction("deleted_at IS NULL")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ControlLogEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "control_log_id")
    private Long controlLogId;

    @Column(name = "device_id", nullable = false)
    private Long deviceId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "actor_type", nullable = false, length = 20)
    private ActorType actorType;

    @Column(name = "command", nullable = false, length = 50)
    private String command;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "command_params", columnDefinition = "jsonb")
    private String commandParams;

    @Enumerated(EnumType.STRING)
    @Column(name = "result", nullable = false, length = 20)
    private ControlResult result;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "correlation_id", length = 100)
    private String correlationId;

    @Builder
    public ControlLogEntity(Long deviceId, Long userId, ActorType actorType,
                            String command, String commandParams, ControlResult result,
                            String errorMessage, String correlationId) {
        this.deviceId = deviceId;
        this.userId = userId;
        this.actorType = actorType;
        this.command = command;
        this.commandParams = commandParams;
        this.result = result;
        this.errorMessage = errorMessage;
        this.correlationId = correlationId;
    }
}
