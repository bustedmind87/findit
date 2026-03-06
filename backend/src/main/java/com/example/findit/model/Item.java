package com.example.findit.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "items")
public class Item {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    @Column(length = 1000)
    private String description;
    private Integer categoryId;
    private String location;
    private LocalDate dateFound;
    private LocalDate dateLost;
    private String reporterContact;
    private String type; // FOUND or LOST
    private String status; // PENDING, APPROVED, etc.
    private Long reporterId;
    private Long claimedById;
    private String claimedByName;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "item_photos", joinColumns = @JoinColumn(name = "item_id"))
    @Lob
    @Column(name = "photo_url", columnDefinition = "CLOB")
    private List<String> photos = new ArrayList<>();

    // getters/setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getCategoryId() { return categoryId; }
    public void setCategoryId(Integer categoryId) { this.categoryId = categoryId; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public LocalDate getDateFound() { return dateFound; }
    public void setDateFound(LocalDate dateFound) { this.dateFound = dateFound; }
    public LocalDate getDateLost() { return dateLost; }
    public void setDateLost(LocalDate dateLost) { this.dateLost = dateLost; }
    public String getReporterContact() { return reporterContact; }
    public void setReporterContact(String reporterContact) { this.reporterContact = reporterContact; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getReporterId() { return reporterId; }
    public void setReporterId(Long reporterId) { this.reporterId = reporterId; }
    public Long getClaimedById() { return claimedById; }
    public void setClaimedById(Long claimedById) { this.claimedById = claimedById; }
    public String getClaimedByName() { return claimedByName; }
    public void setClaimedByName(String claimedByName) { this.claimedByName = claimedByName; }
    public List<String> getPhotos() { return photos; }
    public void setPhotos(List<String> photos) { this.photos = photos; }
}
