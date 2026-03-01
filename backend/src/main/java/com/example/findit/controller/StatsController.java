package com.example.findit.controller;

import com.example.findit.model.Item;
import com.example.findit.service.ItemService;
import com.example.findit.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stats")
public class StatsController {
    private final ItemService itemService;
    private final UserService userService;
    
    public StatsController(ItemService itemService, UserService userService) {
        this.itemService = itemService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStats() {
        List<Item> all = itemService.findAll();
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalItems", all.size());
        stats.put("pendingItems", all.stream().filter(i -> "PENDING".equals(i.getStatus())).count());
        stats.put("approvedItems", all.stream().filter(i -> "APPROVED".equals(i.getStatus())).count());
        stats.put("rejectedItems", all.stream().filter(i -> "REJECTED".equals(i.getStatus())).count());
        stats.put("totalUsers", userService.findAll().size());
        stats.put("itemsByType", Map.of(
            "FOUND", all.stream().filter(i -> "FOUND".equals(i.getType())).count(),
            "LOST", all.stream().filter(i -> "LOST".equals(i.getType())).count()
        ));
        
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/summary")
    public Map<String, Object> summary() {
        List<Item> all = itemService.findAll();
        long total = all.size();
        long found = all.stream().filter(i -> "FOUND".equals(i.getType())).count();
        long lost = all.stream().filter(i -> "LOST".equals(i.getType())).count();
        return Map.<String,Object>of("total", total, "found", found, "lost", lost);
    }

    @GetMapping("/category")
    public List<Map<String,Object>> categoryStats() {
        List<Item> all = itemService.findAll();
        return all.stream()
                .collect(Collectors.groupingBy(Item::getCategoryId, Collectors.counting()))
                .entrySet().stream()
                .map(e -> Map.<String,Object>of("categoryId", e.getKey(), "count", e.getValue()))
                .collect(Collectors.toList());
    }
}
