package com.coliving.global.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ShedLock을 위한 더미 엔티티
 * Hibernate의 ddl-auto update 설정을 통해 shedlock 테이블을 자동으로 생성하기 위해 사용됩니다.
 */
@Entity
@Table(name = "shedlock")
@Getter
@NoArgsConstructor
public class ShedLockEntity {

    @Id
    @Column(name = "name", length = 64)
    private String name;

    @Column(name = "lock_until", nullable = false)
    private LocalDateTime lockUntil;

    @Column(name = "locked_at", nullable = false)
    private LocalDateTime lockedAt;

    @Column(name = "locked_by", nullable = false, length = 255)
    private String lockedBy;
}
