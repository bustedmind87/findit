package com.example.findit.controller;

import com.example.findit.model.Item;
import com.example.findit.service.ItemService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
    private static final Logger LOGGER = LoggerFactory.getLogger(ItemsController.class);
    private final ItemService itemService;
    private final ObjectMapper objectMapper;

    public ItemsController(ItemService itemService, ObjectMapper objectMapper) {
        this.itemService = itemService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public Map<String, Object> list(@RequestParam(required = false) Long owner,
                                    @RequestParam(required = false) String q,
                                    @RequestParam(required = false) String type,
                                    @RequestParam(required = false) String status,
                                    @RequestParam(required = false) Boolean unclaimed) {
        LOGGER.info("BEGIN ItemsController.list owner={} q={} type={} status={} unclaimed={}", owner, q, type, status, unclaimed);
        List<Item> items = itemService.findAll();

        if (owner != null) {
            items = items.stream()
                    .filter(i -> owner.equals(i.getReporterId()))
                    .collect(Collectors.toList());
        }
        if (q != null && !q.isBlank()) {
            String needle = q.toLowerCase();
            items = items.stream()
                .filter(i -> i.getTitle() != null && i.getTitle().toLowerCase().contains(needle))
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

        LOGGER.info("END ItemsController.list size={}", items.size());
        return Map.of("content", items);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Item> get(@PathVariable Long id) {
        LOGGER.info("BEGIN ItemsController.get id={}", id);
        Optional<Item> item = itemService.findById(id);
        if (item.isPresent()) {
            LOGGER.info("END ItemsController.get status=ok id={}", id);
            return ResponseEntity.ok(item.get());
        }
        LOGGER.info("END ItemsController.get status=not_found id={}", id);
        return ResponseEntity.notFound().build();
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> create(
            @RequestPart(value = "item") String itemJson,
            @RequestPart(value = "photos", required = false) List<MultipartFile> photos) {
        LOGGER.info("BEGIN ItemsController.create photosCount={}", photos == null ? 0 : photos.size());
        try {
            Item item = objectMapper.readValue(itemJson, Item.class);
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
            LOGGER.info("END ItemsController.create status=ok itemId={}", savedItem.getId());
            return ResponseEntity.ok(savedItem);
        } catch (IOException e) {
            LOGGER.info("END ItemsController.create status=bad_request reason={}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "File upload failed: " + e.getMessage()));
        } catch (Exception e) {
            LOGGER.info("END ItemsController.create status=bad_request reason={}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to create item: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String,String> body) {
        LOGGER.info("BEGIN ItemsController.updateStatus id={} status={}", id, body.get("status"));
        Optional<Item> o = itemService.findById(id);
        if (o.isEmpty()) {
            LOGGER.info("END ItemsController.updateStatus status=not_found id={}", id);
            return ResponseEntity.notFound().build();
        }

        String nextStatus = body.get("status");
        if (nextStatus == null || nextStatus.isBlank()) {
            LOGGER.info("END ItemsController.updateStatus status=bad_request id={} reason=status_required", id);
            return ResponseEntity.badRequest().body(Map.of("error", "status is required"));
        }

        nextStatus = nextStatus.toUpperCase();
        if (!"APPROVED".equals(nextStatus) && !"REJECTED".equals(nextStatus)) {
            LOGGER.info("END ItemsController.updateStatus status=bad_request id={} reason=invalid_status", id);
            return ResponseEntity.badRequest().body(Map.of("error", "Only APPROVED or REJECTED are allowed here"));
        }

        Item it = o.get();
        if (!"PENDING".equalsIgnoreCase(it.getStatus())) {
            LOGGER.info("END ItemsController.updateStatus status=bad_request id={} reason=not_pending", id);
            return ResponseEntity.badRequest().body(Map.of("error", "Only pending items can be approved or rejected"));
        }

        it.setStatus(nextStatus);
        itemService.save(it);
        LOGGER.info("END ItemsController.updateStatus status=ok id={} nextStatus={}", id, nextStatus);
        return ResponseEntity.ok(it);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        LOGGER.info("BEGIN ItemsController.delete id={}", id);
        itemService.delete(id);
        LOGGER.info("END ItemsController.delete status=ok id={}", id);
        return ResponseEntity.ok().build();
    }
}
