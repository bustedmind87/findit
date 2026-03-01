package com.example.findit.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    public List<String> saveFiles(Long itemId, List<MultipartFile> files) throws IOException {
        List<String> fileNames = new ArrayList<>();
        
        Path itemPath = Paths.get(uploadDir, "items", itemId.toString());
        Files.createDirectories(itemPath);
        
        for (MultipartFile file : files) {
            if (file.isEmpty()) continue;
            
            String originalName = file.getOriginalFilename();
            String extension = originalName != null ? originalName.substring(originalName.lastIndexOf(".")) : ".jpg";
            String uniqueName = UUID.randomUUID() + extension;
            
            Path filePath = itemPath.resolve(uniqueName);
            Files.write(filePath, file.getBytes());
            
            fileNames.add("/api/files/items/" + itemId + "/" + uniqueName);
        }
        
        return fileNames;
    }

    public byte[] getFile(Long itemId, String filename) throws IOException {
        Path filePath = Paths.get(uploadDir, "items", itemId.toString(), filename);
        return Files.readAllBytes(filePath);
    }

    public void deleteFile(Long itemId, String filename) throws IOException {
        Path filePath = Paths.get(uploadDir, "items", itemId.toString(), filename);
        Files.deleteIfExists(filePath);
    }
}
