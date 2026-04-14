package com.coliving.admin.space.application.service;

import com.coliving.admin.space.application.command.CreateAnnotationTypeCommand;
import com.coliving.admin.space.application.command.UpdateAnnotationTypeCommand;
import com.coliving.admin.space.application.port.in.AdminAnnotationTypeUseCase;
import com.coliving.admin.space.application.port.out.AdminAnnotationTypeRepositoryPort;
import com.coliving.admin.space.application.result.AdminAnnotationTypeResult;
import com.coliving.admin.space.model.AdminAnnotationType;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminAnnotationTypeService implements AdminAnnotationTypeUseCase {

    private final AdminAnnotationTypeRepositoryPort annotationTypeRepositoryPort;

    @Override
    @Transactional(readOnly = true)
    public List<AdminAnnotationTypeResult> getAnnotationTypes() {
        return annotationTypeRepositoryPort.findAll().stream()
                .map(AdminAnnotationTypeResult::from)
                .toList();
    }

    @Override
    public AdminAnnotationTypeResult createAnnotationType(CreateAnnotationTypeCommand command) {
        if (annotationTypeRepositoryPort.existsByCode(command.getCode())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }

        AdminAnnotationType model = AdminAnnotationType.builder()
                .code(command.getCode())
                .name(command.getName())
                .iconName(command.getIconName())
                .defaultColor(command.getDefaultColor() != null ? command.getDefaultColor() : "primary")
                .isSystemDefault(false)
                .build();

        AdminAnnotationType saved = annotationTypeRepositoryPort.save(model);
        return AdminAnnotationTypeResult.from(saved);
    }

    @Override
    public AdminAnnotationTypeResult updateAnnotationType(UpdateAnnotationTypeCommand command) {
        AdminAnnotationType existing = annotationTypeRepositoryPort.findById(command.getAnnotationTypeId())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        AdminAnnotationType updated = AdminAnnotationType.builder()
                .annotationTypeId(existing.getAnnotationTypeId())
                .code(existing.getCode())
                .name(command.getName())
                .iconName(command.getIconName())
                .defaultColor(command.getDefaultColor())
                .isSystemDefault(existing.getIsSystemDefault())
                .build();

        AdminAnnotationType saved = annotationTypeRepositoryPort.save(updated);
        return AdminAnnotationTypeResult.from(saved);
    }

    @Override
    public void deleteAnnotationType(Long annotationTypeId) {
        AdminAnnotationType existing = annotationTypeRepositoryPort.findById(annotationTypeId)
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_FOUND));

        annotationTypeRepositoryPort.delete(annotationTypeId);
    }
}
