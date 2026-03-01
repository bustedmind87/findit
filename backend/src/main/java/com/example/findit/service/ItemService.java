package com.example.findit.service;

import com.example.findit.model.Item;
import com.example.findit.repository.ItemRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class ItemService {
    private final ItemRepository itemRepository;
    public ItemService(ItemRepository itemRepository) { this.itemRepository = itemRepository; }

    public Item save(Item item) { return itemRepository.save(item); }
    public List<Item> findAll() { return itemRepository.findAll(); }
    public Optional<Item> findById(Long id) { return itemRepository.findById(id); }
    public List<Item> findByReporterId(Long id) { return itemRepository.findByReporterId(id); }
    public List<Item> findByType(String type) { return itemRepository.findByType(type); }
    public List<Item> findByStatus(String status) { return itemRepository.findByStatus(status); }
    public void delete(Long id) { itemRepository.deleteById(id); }
}
