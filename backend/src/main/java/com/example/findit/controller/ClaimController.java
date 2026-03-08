package com.example.findit.controller;

import com.example.findit.model.Claim;
import com.example.findit.service.ClaimService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/claims")
public class ClaimController {
    private static final Logger LOGGER = LoggerFactory.getLogger(ClaimController.class);
    private final ClaimService claimService;
    
    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Claim claim) {
        LOGGER.info("BEGIN ClaimController.create itemId={} claimerId={}", claim.getItemId(), claim.getClaimerId());
        try {
            Claim created = claimService.create(claim);
            LOGGER.info("END ClaimController.create status=ok claimId={}", created.getId());
            return ResponseEntity.ok(created);
        } catch (IllegalStateException e) {
            LOGGER.info("END ClaimController.create status=bad_request reason={}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping
    public List<Claim> list(@RequestParam(required = false) Long itemId,
                            @RequestParam(required = false) Long claimerId,
                            @RequestParam(required = false) String status) {
        LOGGER.info("BEGIN ClaimController.list itemId={} claimerId={} status={}", itemId, claimerId, status);
        if (itemId != null) {
            List<Claim> claims = claimService.findByItemId(itemId);
            LOGGER.info("END ClaimController.list size={} filter=itemId", claims.size());
            return claims;
        }
        if (claimerId != null) {
            List<Claim> claims = claimService.findByClaimerId(claimerId);
            LOGGER.info("END ClaimController.list size={} filter=claimerId", claims.size());
            return claims;
        }
        if (status != null) {
            List<Claim> claims = claimService.findByStatus(status);
            LOGGER.info("END ClaimController.list size={} filter=status", claims.size());
            return claims;
        }
        List<Claim> claims = claimService.findAll();
        LOGGER.info("END ClaimController.list size={} filter=all", claims.size());
        return claims;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Claim> get(@PathVariable Long id) {
        LOGGER.info("BEGIN ClaimController.get id={}", id);
        Optional<Claim> claim = claimService.findById(id);
        if (claim.isPresent()) {
            LOGGER.info("END ClaimController.get status=ok id={}", id);
            return ResponseEntity.ok(claim.get());
        }
        LOGGER.info("END ClaimController.get status=not_found id={}", id);
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestBody java.util.Map<String, String> body) {
        String status = body.get("status");
        LOGGER.info("BEGIN ClaimController.updateStatus id={} status={}", id, status);
        try {
            Claim updated = claimService.updateStatus(id, status);
            if (updated != null) {
                LOGGER.info("END ClaimController.updateStatus status=ok id={}", id);
                return ResponseEntity.ok(updated);
            }
            LOGGER.info("END ClaimController.updateStatus status=not_found id={}", id);
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            LOGGER.info("END ClaimController.updateStatus status=bad_request id={} reason={}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        LOGGER.info("BEGIN ClaimController.delete id={}", id);
        claimService.delete(id);
        LOGGER.info("END ClaimController.delete status=ok id={}", id);
        return ResponseEntity.ok().build();
    }
}
