package com.coliving.admin.space.application.port.out;

import org.springframework.web.multipart.MultipartFile;
import java.util.Optional;

public interface FileStoragePort {
    /**
     * 파일을 저장하고 저장된 절대 경로(또는 URL 경로)를 반환합니다.
     */
    String storeFile(Long spaceId, MultipartFile file);

    /**
     * 파일을 삭제합니다.
     */
    void deleteFile(String path);

    /**
     * 파일을 불러옵니다.
     */
    java.nio.file.Path loadFile(Long spaceId, String fileName);
}
