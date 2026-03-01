package com.example.findit.repository;

import com.example.findit.model.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByReporterId(Long reporterId);
    List<Item> findByType(String type);
    List<Item> findByStatus(String status);
}
