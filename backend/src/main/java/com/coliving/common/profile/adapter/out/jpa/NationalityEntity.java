package com.coliving.common.profile.adapter.out.jpa;

import com.coliving.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "nationalities")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE nationalities SET deleted_at = CURRENT_TIMESTAMP WHERE code = ?")
@SQLRestriction("deleted_at IS NULL")
public class NationalityEntity extends BaseEntity {

    @Id
    @Column(length = 2)
    private String code;

    @Column(nullable = false, length = 100)
    private String nameKo;

    @Column(nullable = false, length = 100)
    private String nameEn;

    @lombok.Setter
    @Column(length = 100)
    private String nameNative;
}
