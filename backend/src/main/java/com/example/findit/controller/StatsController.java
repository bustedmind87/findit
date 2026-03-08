package com.example.findit.controller;

import com.example.findit.model.Item;
import com.example.findit.service.ItemService;
import com.example.findit.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/stats")
public class StatsController {
    private static final Logger LOGGER = LoggerFactory.getLogger(StatsController.class);
    private final ItemService itemService;
    private final UserService userService;
    
    public StatsController(ItemService itemService, UserService userService) {
        this.itemService = itemService;
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStats() {
        LOGGER.info("BEGIN StatsController.getStats");
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
        
        LOGGER.info("END StatsController.getStats totalItems={} totalUsers={}", all.size(), userService.findAll().size());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/summary")
        public Map<String, Object> summary(@RequestParam(defaultValue = "30") int days) {
        LOGGER.info("BEGIN StatsController.summary days={}", days);
        List<Item> all = itemService.findAll();
        int safeDays = Math.max(days, 1);
        LocalDate since = LocalDate.now().minusDays(safeDays);

        long found = all.stream()
            .filter(i -> "FOUND".equalsIgnoreCase(i.getType()))
            .filter(i -> i.getDateFound() != null && !i.getDateFound().isBefore(since))
            .count();

        long lost = all.stream()
            .filter(i -> "LOST".equalsIgnoreCase(i.getType()))
            .filter(i -> i.getDateLost() != null && !i.getDateLost().isBefore(since))
            .count();

        Map<String, Object> result = Map.<String,Object>of(
            "days", safeDays,
            "found", found,
            "lost", lost,
            "pending", all.stream().filter(i -> "PENDING".equalsIgnoreCase(i.getStatus())).count()
        );
        LOGGER.info("END StatsController.summary days={} found={} lost={}", safeDays, found, lost);
        return result;
    }

    @GetMapping("/category")
    public List<Map<String,Object>> categoryStats() {
        LOGGER.info("BEGIN StatsController.categoryStats");
        List<Item> all = itemService.findAll();
        List<Map<String,Object>> result = all.stream()
                .collect(Collectors.groupingBy(Item::getCategoryId, Collectors.counting()))
                .entrySet().stream()
                .map(e -> Map.<String,Object>of("categoryId", e.getKey(), "count", e.getValue()))
                .collect(Collectors.toList());
        LOGGER.info("END StatsController.categoryStats categories={}", result.size());
        return result;
    }
}
