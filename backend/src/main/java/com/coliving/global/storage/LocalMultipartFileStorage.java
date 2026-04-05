package com.coliving.global.storage;

import com.coliving.common.community.model.PostAttachment;
import com.coliving.common.voc.model.VocAttachment;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Component
public class LocalMultipartFileStorage {

    private final Path baseDir = Paths.get("data", "uploads").toAbsolutePath().normalize();

    public List<PostAttachment> storePostFiles(List<MultipartFile> files) {
        return storeFiles(files, "community", this::toPostAttachment);
    }

    /** 에디터 본문 삽입용 이미지 1장 (image/* 만 허용). */
    public PostAttachment storeSinglePostImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        return toPostAttachment(file, "community");
    }

    public List<VocAttachment> storeVocFiles(List<MultipartFile> files) {
        return storeFiles(files, "voc", this::toVocAttachment);
    }

    /** 민원 본문 에디터 삽입용 이미지 1장 (image/* 만 허용). */
    public VocAttachment storeSingleVocImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.toLowerCase().startsWith("image/")) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        return toVocAttachment(file, "voc");
    }

    private <T> List<T> storeFiles(List<MultipartFile> files, String subdir, FileMapper<T> mapper) {
        if (files == null) {
            return List.of();
        }
        List<T> out = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            out.add(mapper.map(file, subdir));
        }
        return out;
    }

    private PostAttachment toPostAttachment(MultipartFile file, String subdir) {
        String stored = storeToDisk(file, subdir);
        return PostAttachment.builder()
                .fileUrl("/api/files/" + subdir + "/" + stored)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .build();
    }

    private VocAttachment toVocAttachment(MultipartFile file, String subdir) {
        String stored = storeToDisk(file, subdir);
        return VocAttachment.builder()
                .fileUrl("/api/files/" + subdir + "/" + stored)
                .fileName(file.getOriginalFilename())
                .fileSize(file.getSize())
                .build();
    }

    private String storeToDisk(MultipartFile file, String subdir) {
        String original = StringUtils.hasText(file.getOriginalFilename()) ? file.getOriginalFilename() : "file";
        String safe = original.replaceAll("[^a-zA-Z0-9._-]", "_");
        String stored = UUID.randomUUID() + "_" + safe;
        Path dir = baseDir.resolve(subdir).normalize();
        if (!dir.startsWith(baseDir)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }
        try {
            Files.createDirectories(dir);
            Path target = dir.resolve(stored).normalize();
            if (!target.startsWith(dir)) {
                throw new BusinessException(ErrorCode.VALIDATION_ERROR);
            }
            file.transferTo(target);
            return stored;
        } catch (IOException e) {
            throw new BusinessException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    public Path resolveWithinSubdir(String subdir, String filename) {
        Path dir = baseDir.resolve(subdir).normalize();
        if (!dir.startsWith(baseDir)) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }
        Path file = dir.resolve(Objects.requireNonNull(filename, "filename")).normalize();
        if (!file.startsWith(dir) || !Files.exists(file)) {
            throw new BusinessException(ErrorCode.NOT_FOUND);
        }
        return file;
    }

    @FunctionalInterface
    private interface FileMapper<T> {
        T map(MultipartFile file, String subdir);
    }
}
