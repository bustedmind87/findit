package com.example.findit.repository;

import com.example.findit.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByItemId(Long itemId);
    List<Claim> findByClaimerId(Long claimerId);
    List<Claim> findByStatus(String status);
    List<Claim> findByItemIdAndStatus(Long itemId, String status);
    Optional<Claim> findFirstByItemIdAndClaimerIdAndStatus(Long itemId, Long claimerId, String status);
}
