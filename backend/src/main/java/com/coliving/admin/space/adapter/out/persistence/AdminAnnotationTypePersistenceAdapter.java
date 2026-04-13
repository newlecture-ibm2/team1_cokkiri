package com.coliving.admin.space.adapter.out.persistence;

import com.coliving.admin.space.application.port.out.AdminAnnotationTypeRepositoryPort;
import com.coliving.admin.space.model.AdminAnnotationType;
import com.coliving.admin.space.adapter.out.jpa.AnnotationTypeEntity;
import com.coliving.admin.space.adapter.out.jpa.AnnotationTypeJpaRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class AdminAnnotationTypePersistenceAdapter implements AdminAnnotationTypeRepositoryPort {

    private final AnnotationTypeJpaRepository annotationTypeJpaRepository;

    @Override
    public List<AdminAnnotationType> findAll() {
        return annotationTypeJpaRepository.findAll().stream()
                .map(this::toModel)
                .toList();
    }

    @Override
    public Optional<AdminAnnotationType> findById(Long annotationTypeId) {
        return annotationTypeJpaRepository.findById(annotationTypeId).map(this::toModel);
    }

    @Override
    public boolean existsByCode(String code) {
        return annotationTypeJpaRepository.findByCode(code).isPresent();
    }

    @Override
    public AdminAnnotationType save(AdminAnnotationType annotationType) {
        AnnotationTypeEntity entity;
        if (annotationType.getAnnotationTypeId() != null) {
            entity = annotationTypeJpaRepository.findById(annotationType.getAnnotationTypeId()).orElseThrow();
            entity.update(annotationType.getName(), annotationType.getIconName(), annotationType.getDefaultColor());
        } else {
            entity = AnnotationTypeEntity.builder()
                    .code(annotationType.getCode())
                    .name(annotationType.getName())
                    .iconName(annotationType.getIconName())
                    .defaultColor(annotationType.getDefaultColor())
                    .isSystemDefault(annotationType.getIsSystemDefault())
                    .build();
        }
        return toModel(annotationTypeJpaRepository.save(entity));
    }

    @Override
    public void delete(Long annotationTypeId) {
        AnnotationTypeEntity entity = annotationTypeJpaRepository.findById(annotationTypeId).orElseThrow();
        entity.softDelete();
        annotationTypeJpaRepository.save(entity);
    }

    private AdminAnnotationType toModel(AnnotationTypeEntity entity) {
        return AdminAnnotationType.builder()
                .annotationTypeId(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .iconName(entity.getIconName())
                .defaultColor(entity.getDefaultColor())
                .isSystemDefault(entity.getIsSystemDefault())
                .build();
    }
}
