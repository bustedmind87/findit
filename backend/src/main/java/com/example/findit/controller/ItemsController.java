package com.example.findit.controller;

import com.example.findit.model.Item;
import com.example.findit.service.ItemService;
import com.example.findit.service.FileStorageService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/items")
public class ItemsController {
    private final ItemService itemService;
    private final FileStorageService fileStorageService;
    
    public ItemsController(ItemService itemService, FileStorageService fileStorageService) {
        this.itemService = itemService;
        this.fileStorageService = fileStorageService;
    }

    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) Long owner,
                                    @RequestParam(required = false) String type,
                                    @RequestParam(required = false) String status) {
        List<Item> items;
        if (owner != null) {
            items = itemService.findByReporterId(owner);
        } else if (type != null) {
            items = itemService.findByType(type);
        } else if (status != null) {
            items = itemService.findByStatus(status);
        } else {
            items = itemService.findAll();
        }
        return Map.of("content", items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> get(@PathVariable Long id) {
        return itemService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> create(
            @RequestPart(value = "item") String itemJson,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos) {
        try {
            // Parse item JSON from blob
            ObjectMapper mapper = new ObjectMapper();
            Item item = mapper.readValue(itemJson, Item.class);
            item.setStatus("PENDING");
            
            // Save item first
            Item savedItem = itemService.save(item);
            
            // Handle file uploads if present
            if (photos != null && !photos.isEmpty()) {
                List<String> fileUrls = fileStorageService.saveFiles(savedItem.getId(), photos);
                // Store file URLs in item (optional - you could store in separate table)
            }
            
            return ResponseEntity.ok(savedItem);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "File upload failed: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create item: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String,String> body) {
        Optional<Item> o = itemService.findById(id);
        if (o.isEmpty()) return ResponseEntity.notFound().build();
        Item it = o.get();
        it.setStatus(body.get("status"));
        itemService.save(it);
        return ResponseEntity.ok(it);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        itemService.delete(id);
        return ResponseEntity.ok().build();
    }
}
