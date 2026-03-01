package com.example.findit.service;

import com.example.findit.model.QA;
import com.example.findit.repository.QARepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class QAService {
    private final QARepository qaRepository;
    
    public QAService(QARepository qaRepository) {
        this.qaRepository = qaRepository;
    }

    public QA create(QA qa) {
        return qaRepository.save(qa);
    }

    public Optional<QA> findById(Long id) {
        return qaRepository.findById(id);
    }

    public List<QA> findAll() {
        return qaRepository.findAll();
    }

    public QA update(Long id, QA qa) {
        Optional<QA> existing = qaRepository.findById(id);
        if (existing.isPresent()) {
            QA q = existing.get();
            if (qa.getQuestion() != null) q.setQuestion(qa.getQuestion());
            if (qa.getAnswer() != null) q.setAnswer(qa.getAnswer());
            return qaRepository.save(q);
        }
        return null;
    }

    public void delete(Long id) {
        qaRepository.deleteById(id);
    }
}
