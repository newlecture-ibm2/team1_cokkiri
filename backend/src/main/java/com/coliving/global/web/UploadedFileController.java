package com.coliving.global.web;

import com.coliving.global.storage.LocalMultipartFileStorage;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.nio.file.Path;

@RestController
public class UploadedFileController {

    private final LocalMultipartFileStorage storage;

    public UploadedFileController(LocalMultipartFileStorage storage) {
        this.storage = storage;
    }

    @GetMapping("/api/files/community/{filename:.+}")
    public ResponseEntity<Resource> getCommunityFile(@PathVariable String filename) {
        return serve("community", filename);
    }

    @GetMapping("/api/files/voc/{filename:.+}")
    public ResponseEntity<Resource> getVocFile(@PathVariable String filename) {
        return serve("voc", filename);
    }

    private ResponseEntity<Resource> serve(String subdir, String filename) {
        Path path = storage.resolveWithinSubdir(subdir, filename);
        Resource resource = new FileSystemResource(path);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + path.getFileName() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
