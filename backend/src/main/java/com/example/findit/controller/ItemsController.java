package com.example.findit.controller;

import com.example.findit.model.Item;
import com.example.findit.service.ItemService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/items")
public class ItemsController {
    private final ItemService itemService;

    public ItemsController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) Long owner,
                                    @RequestParam(required = false) String type,
                                    @RequestParam(required = false) String status,
                                    @RequestParam(required = false) Boolean unclaimed) {
        List<Item> items = itemService.findAll();

        if (owner != null) {
            items = items.stream()
                    .filter(i -> owner.equals(i.getReporterId()))
                    .collect(Collectors.toList());
        }
        if (type != null) {
            items = items.stream()
                    .filter(i -> type.equalsIgnoreCase(i.getType()))
                    .collect(Collectors.toList());
        }
        if (status != null) {
            items = items.stream()
                    .filter(i -> status.equalsIgnoreCase(i.getStatus()))
                    .collect(Collectors.toList());
        }
        if (Boolean.TRUE.equals(unclaimed)) {
            items = items.stream()
                    .filter(i -> i.getClaimedById() == null)
                    .collect(Collectors.toList());
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
            
            // Save image payloads directly as Base64 data URLs in DB.
            if (photos != null && !photos.isEmpty()) {
                List<String> encodedPhotos = new ArrayList<>();
                for (MultipartFile photo : photos) {
                    if (photo == null || photo.isEmpty()) {
                        continue;
                    }
                    String contentType = photo.getContentType();
                    if (contentType == null || contentType.isBlank()) {
                        contentType = "image/jpeg";
                    }
                    String base64 = Base64.getEncoder().encodeToString(photo.getBytes());
                    encodedPhotos.add("data:" + contentType + ";base64," + base64);
                }
                item.setPhotos(encodedPhotos);
            }

            Item savedItem = itemService.save(item);
            
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

        String nextStatus = body.get("status");
        if (nextStatus == null || nextStatus.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "status is required"));
        }

        nextStatus = nextStatus.toUpperCase();
        if (!"APPROVED".equals(nextStatus) && !"REJECTED".equals(nextStatus)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only APPROVED or REJECTED are allowed here"));
        }

        Item it = o.get();
        if (!"PENDING".equalsIgnoreCase(it.getStatus())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only pending items can be approved or rejected"));
        }

        it.setStatus(nextStatus);
        itemService.save(it);
        return ResponseEntity.ok(it);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        itemService.delete(id);
        return ResponseEntity.ok().build();
    }
}
