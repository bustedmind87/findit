package com.example.findit.controller;

import com.example.findit.model.Claim;
import com.example.findit.service.ClaimService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {
    private final ClaimService claimService;
    
    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Claim claim) {
        try {
            Claim created = claimService.create(claim);
            return ResponseEntity.ok(created);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public List<Claim> list(@RequestParam(required = false) Long itemId,
                            @RequestParam(required = false) Long claimerId,
                            @RequestParam(required = false) String status) {
        if (itemId != null) {
            return claimService.findByItemId(itemId);
        }
        if (claimerId != null) {
            return claimService.findByClaimerId(claimerId);
        }
        if (status != null) {
            return claimService.findByStatus(status);
        }
        return claimService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Claim> get(@PathVariable Long id) {
        Optional<Claim> claim = claimService.findById(id);
        return claim.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        try {
            Claim updated = claimService.updateStatus(id, status);
            if (updated != null) {
                return ResponseEntity.ok(updated);
            }
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        claimService.delete(id);
        return ResponseEntity.ok().build();
    }
}
