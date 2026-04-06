package com.coliving.user.room.adapter.out.jpa;

import com.coliving.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "room_types")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@SQLDelete(sql = "UPDATE room_types SET deleted_at = CURRENT_TIMESTAMP WHERE room_type_id = ?")
@SQLRestriction("deleted_at IS NULL")
public class RoomTypeEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_type_id")
    private Long id;

    @Column(name = "code", length = 50, unique = true, nullable = false)
    private String code;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "is_system_default", nullable = false)
    private Boolean isSystemDefault;

    @Builder
    public RoomTypeEntity(String code, String name, Boolean isSystemDefault) {
        this.code = code;
        this.name = name;
        this.isSystemDefault = isSystemDefault;
    }

    public void update(String name) {
        this.name = name;
    }
}
