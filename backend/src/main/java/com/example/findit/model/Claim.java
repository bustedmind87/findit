package com.example.findit.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "claims")
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Long itemId;
    
    @Column(nullable = false)
    private Long claimerId;

    private String claimerName;

    private String claimerContact;
    
    @Column(length = 1000)
    private String description;
    
    private String status; // PENDING, APPROVED, REJECTED
    
    private LocalDateTime createdAt;
    
    private LocalDateTime updatedAt;

    // Getters/Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getItemId() { return itemId; }
    public void setItemId(Long itemId) { this.itemId = itemId; }
    
    public Long getClaimerId() { return claimerId; }
    public void setClaimerId(Long claimerId) { this.claimerId = claimerId; }

    public String getClaimerName() { return claimerName; }
    public void setClaimerName(String claimerName) { this.claimerName = claimerName; }

    public String getClaimerContact() { return claimerContact; }
    public void setClaimerContact(String claimerContact) { this.claimerContact = claimerContact; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
