package com.coliving.admin.space.adapter.out.storage;

import com.coliving.admin.space.application.port.out.FileStoragePort;
import com.coliving.global.error.BusinessException;
import com.coliving.global.error.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Component
public class LocalFileStorageAdapter implements FileStoragePort {

    private final Path fileStorageLocation;
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    public LocalFileStorageAdapter(@Value("${app.upload.dir:/uploads/spaces}") String uploadDir) {
        this.fileStorageLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("업로드 폴더를 생성할 수 없습니다.", ex);
        }
    }

    @Override
    public String storeFile(Long spaceId, MultipartFile file) {
        // 1. 용량 검증 (5MB)
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BusinessException(ErrorCode.FILE_SIZE_EXCEEDED);
        }

        // 2. MIME 타입 검증
        String contentType = file.getContentType();
        if (contentType == null || !(contentType.equals("image/jpeg") || contentType.equals("image/png")
                || contentType.equals("image/webp") || contentType.equals("image/svg+xml"))) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR);
        }

        // 3. 파일 이름 및 경로 설정
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String extension = "";
        int i = originalFileName.lastIndexOf('.');
        if (i > 0) {
            extension = originalFileName.substring(i);
        }

        String newFileName = UUID.randomUUID().toString() + extension;
        Path targetSpaceDir = this.fileStorageLocation.resolve(String.valueOf(spaceId));

        try {
            Files.createDirectories(targetSpaceDir);
            Path targetLocation = targetSpaceDir.resolve(newFileName);

            // 매직 바이트 검사 등은 생략하거나 추가 검증 라이브러리 연동 가능
            file.transferTo(targetLocation.toFile());

            // API 엔드포인트에서 파일명만 알면 되므로 파일명만 리턴
            return newFileName;

        } catch (IOException ex) {
            throw new RuntimeException("파일을 저장할 수 없습니다. " + newFileName, ex);
        }
    }

    @Override
    public void deleteFile(String path) {
        try {
            if (path != null) {
                String relativePath = null;
                if (path.startsWith("/api/uploads/spaces/")) {
                    relativePath = path.substring("/api/uploads/spaces/".length());
                } else if (path.startsWith("/uploads/spaces/")) {
                    relativePath = path.substring("/uploads/spaces/".length());
                }
                
                if (relativePath != null) {
                    Path targetPath = this.fileStorageLocation.resolve(relativePath).normalize();
                    Files.deleteIfExists(targetPath);
                }
            }
        } catch (IOException e) {
            System.err.println("파일 삭제 실패: " + path);
        }
    }

    @Override
    public Path loadFile(Long spaceId, String fileName) {
        try {
            Path targetPath = this.fileStorageLocation.resolve(String.valueOf(spaceId)).resolve(fileName).normalize();
            if (!Files.exists(targetPath)) {
                throw new BusinessException(ErrorCode.SPACE_IMAGE_NOT_FOUND);
            }
            return targetPath;
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.SPACE_IMAGE_NOT_FOUND);
        }
    }
}
