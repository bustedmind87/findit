package com.example.findit.controller;

import com.example.findit.model.QA;
import com.example.findit.service.QAService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/qa")
public class QAController {
    private final QAService qaService;
    
    public QAController(QAService qaService) {
        this.qaService = qaService;
    }

    @PostMapping
    public ResponseEntity<QA> create(@RequestBody QA qa) {
        QA created = qaService.create(qa);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public List<QA> list() {
        return qaService.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<QA> get(@PathVariable Long id) {
        Optional<QA> qa = qaService.findById(id);
        return qa.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<QA> update(@PathVariable Long id, @RequestBody QA qa) {
        QA updated = qaService.update(id, qa);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        qaService.delete(id);
        return ResponseEntity.ok().build();
    }
}
