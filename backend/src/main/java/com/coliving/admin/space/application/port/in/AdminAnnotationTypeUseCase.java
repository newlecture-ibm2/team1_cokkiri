package com.coliving.admin.space.application.port.in;

import com.coliving.admin.space.application.command.CreateAnnotationTypeCommand;
import com.coliving.admin.space.application.command.UpdateAnnotationTypeCommand;
import com.coliving.admin.space.application.result.AdminAnnotationTypeResult;

import java.util.List;

public interface AdminAnnotationTypeUseCase {
    List<AdminAnnotationTypeResult> getAnnotationTypes();
    AdminAnnotationTypeResult createAnnotationType(CreateAnnotationTypeCommand command);
    AdminAnnotationTypeResult updateAnnotationType(UpdateAnnotationTypeCommand command);
    void deleteAnnotationType(Long annotationTypeId);
}
