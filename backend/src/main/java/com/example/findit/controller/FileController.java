package com.example.findit.controller;

import com.example.findit.service.FileStorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;

@RestController
@RequestMapping("/api/files")
public class FileController {
    private static final Logger LOGGER = LoggerFactory.getLogger(FileController.class);
    private final FileStorageService fileStorageService;
    
    public FileController(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    @GetMapping("/items/{itemId}/{filename}")
    public ResponseEntity<byte[]> getFile(@PathVariable Long itemId, 
                                          @PathVariable String filename) {
        LOGGER.info("BEGIN FileController.getFile itemId={} filename={}", itemId, filename);
        try {
            byte[] fileData = fileStorageService.getFile(itemId, filename);
            LOGGER.info("END FileController.getFile status=ok itemId={} filename={} bytes={}", itemId, filename, fileData.length);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(fileData);
        } catch (IOException e) {
            LOGGER.info("END FileController.getFile status=not_found itemId={} filename={}", itemId, filename);
            return ResponseEntity.notFound().build();
        }
    }
}
