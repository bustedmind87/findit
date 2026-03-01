package com.example.findit.service;

import com.example.findit.model.Claim;
import com.example.findit.repository.ClaimRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class ClaimService {
    private final ClaimRepository claimRepository;
    
    public ClaimService(ClaimRepository claimRepository) {
        this.claimRepository = claimRepository;
    }

    public Claim create(Claim claim) {
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

    public Claim updateStatus(Long id, String status) {
        Optional<Claim> claim = claimRepository.findById(id);
        if (claim.isPresent()) {
            Claim c = claim.get();
            c.setStatus(status);
            c.setUpdatedAt(LocalDateTime.now());
            return claimRepository.save(c);
        }
        return null;
    }

    public void delete(Long id) {
        claimRepository.deleteById(id);
    }
}
