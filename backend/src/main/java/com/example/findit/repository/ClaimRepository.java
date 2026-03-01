package com.example.findit.repository;

import com.example.findit.model.Claim;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByItemId(Long itemId);
    List<Claim> findByClaimerId(Long claimerId);
    List<Claim> findByStatus(String status);
}
