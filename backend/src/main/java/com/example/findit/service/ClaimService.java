package com.example.findit.service;

import com.example.findit.model.Claim;
import com.example.findit.model.Item;
import com.example.findit.model.User;
import com.example.findit.repository.ClaimRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ClaimService {
    private final ClaimRepository claimRepository;
    private final ItemService itemService;
    private final UserService userService;

    public ClaimService(ClaimRepository claimRepository, ItemService itemService, UserService userService) {
        this.claimRepository = claimRepository;
        this.itemService = itemService;
        this.userService = userService;
    }

    public Claim create(Claim claim) {
        if (claim.getItemId() == null || claim.getClaimerId() == null) {
            throw new IllegalStateException("itemId and claimerId are required");
        }

        Optional<User> claimer = userService.findById(claim.getClaimerId());
        if (claimer.isPresent() && "ADMIN".equalsIgnoreCase(claimer.get().getRole())) {
            throw new IllegalStateException("Admin cannot claim items");
        }

        Item item = itemService.findById(claim.getItemId())
                .orElseThrow(() -> new IllegalStateException("Item not found"));

        boolean isAvailable = "APPROVED".equalsIgnoreCase(item.getStatus()) && item.getClaimedById() == null;
        if (!isAvailable) {
            throw new IllegalStateException("Item is not available for claiming");
        }

        Optional<Claim> existingPending = claimRepository.findFirstByItemIdAndClaimerIdAndStatus(
                claim.getItemId(), claim.getClaimerId(), "PENDING");
        if (existingPending.isPresent()) {
            throw new IllegalStateException("You already have a pending claim for this item");
        }

        claim.setStatus("PENDING");
        claim.setCreatedAt(LocalDateTime.now());
        claim.setUpdatedAt(LocalDateTime.now());
        return claimRepository.save(claim);
    }

    public Optional<Claim> findById(Long id) {
        return claimRepository.findById(id);
    }

    public List<Claim> findByItemId(Long itemId) {
        return claimRepository.findByItemId(itemId);
    }

    public List<Claim> findByClaimerId(Long claimerId) {
        return claimRepository.findByClaimerId(claimerId);
    }

    public List<Claim> findByStatus(String status) {
        return claimRepository.findByStatus(status);
    }

    public List<Claim> findAll() {
        return claimRepository.findAll();
    }

    @Transactional
    public Claim updateStatus(Long id, String status) {
        Optional<Claim> claim = claimRepository.findById(id);
        if (claim.isEmpty()) {
            return null;
        }

        String nextStatus = status == null ? "" : status.toUpperCase();
        if (!"APPROVED".equals(nextStatus) && !"REJECTED".equals(nextStatus) && !"PENDING".equals(nextStatus)) {
            throw new IllegalStateException("Invalid claim status");
        }

        Claim c = claim.get();
        if (!"PENDING".equalsIgnoreCase(c.getStatus()) && !"PENDING".equals(nextStatus)) {
            throw new IllegalStateException("Claim already reviewed");
        }

        c.setStatus(nextStatus);
        c.setUpdatedAt(LocalDateTime.now());
        Claim saved = claimRepository.save(c);

        if ("APPROVED".equals(nextStatus)) {
            Item item = itemService.findById(c.getItemId())
                    .orElseThrow(() -> new IllegalStateException("Item not found"));

            boolean claimable = "APPROVED".equalsIgnoreCase(item.getStatus()) && item.getClaimedById() == null;
            if (!claimable) {
                throw new IllegalStateException("Item is already claimed or unavailable");
            }

            item.setStatus("CLAIMED");
            item.setClaimedById(c.getClaimerId());
            if (c.getClaimerName() != null && !c.getClaimerName().isBlank()) {
                item.setClaimedByName(c.getClaimerName());
            }
            itemService.save(item);

            List<Claim> pendingForSameItem = claimRepository.findByItemIdAndStatus(c.getItemId(), "PENDING");
            for (Claim other : pendingForSameItem) {
                if (!other.getId().equals(c.getId())) {
                    other.setStatus("REJECTED");
                    other.setUpdatedAt(LocalDateTime.now());
                    claimRepository.save(other);
                }
            }
        }

        return saved;
    }

    public void delete(Long id) {
        claimRepository.deleteById(id);
    }
}
