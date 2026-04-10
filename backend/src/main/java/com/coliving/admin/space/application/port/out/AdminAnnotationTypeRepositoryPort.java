package com.coliving.admin.space.application.port.out;

import com.coliving.admin.space.model.AdminAnnotationType;

import java.util.List;
import java.util.Optional;

public interface AdminAnnotationTypeRepositoryPort {
    List<AdminAnnotationType> findAll();
    Optional<AdminAnnotationType> findById(Long annotationTypeId);
    boolean existsByCode(String code);
    AdminAnnotationType save(AdminAnnotationType annotationType);
    void delete(Long annotationTypeId);
}
