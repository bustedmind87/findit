package com.example.findit.controller;

import com.example.findit.model.QA;
import com.example.findit.service.QAService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/qa")
public class QAController {
    private static final Logger LOGGER = LoggerFactory.getLogger(QAController.class);
    private final QAService qaService;
    
    public QAController(QAService qaService) {
        this.qaService = qaService;
    }

    @PostMapping
    public ResponseEntity<QA> create(@RequestBody QA qa) {
        LOGGER.info("BEGIN QAController.create");
        QA created = qaService.create(qa);
        LOGGER.info("END QAController.create status=ok id={}", created.getId());
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public List<QA> list() {
        LOGGER.info("BEGIN QAController.list");
        List<QA> result = qaService.findAll();
        LOGGER.info("END QAController.list size={}", result.size());
        return result;
    }

    @GetMapping("/{id}")
    public ResponseEntity<QA> get(@PathVariable Long id) {
        LOGGER.info("BEGIN QAController.get id={}", id);
        Optional<QA> qa = qaService.findById(id);
        if (qa.isPresent()) {
            LOGGER.info("END QAController.get status=ok id={}", id);
            return ResponseEntity.ok(qa.get());
        }
        LOGGER.info("END QAController.get status=not_found id={}", id);
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<QA> update(@PathVariable Long id, @RequestBody QA qa) {
        LOGGER.info("BEGIN QAController.update id={}", id);
        QA updated = qaService.update(id, qa);
        if (updated != null) {
            LOGGER.info("END QAController.update status=ok id={}", id);
            return ResponseEntity.ok(updated);
        }
        LOGGER.info("END QAController.update status=not_found id={}", id);
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        LOGGER.info("BEGIN QAController.delete id={}", id);
        qaService.delete(id);
        LOGGER.info("END QAController.delete status=ok id={}", id);
        return ResponseEntity.ok().build();
    }
}
