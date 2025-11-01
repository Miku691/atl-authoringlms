package com.atl.mcq.service;

import com.atl.mcq.entity.AtlQuestion;
import com.atl.mcq.repo.AtlQuestionRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AtlQuestionService {
    @Autowired
    private AtlQuestionRepo questionRepo;

    public AtlQuestion addAtlQuestion(AtlQuestion AtlQuestion) {
        return questionRepo.save(AtlQuestion);
    }

    public List<AtlQuestion> getAllAtlQuestions() {
        return questionRepo.findAll();
    }

    public List<AtlQuestion> getByCategory(String category) {
        return questionRepo.findByCategory(category);
    }

    public List<AtlQuestion> getByType(String type) {
        return questionRepo.findByType(type);
    }

    public List<AtlQuestion> getRandomAtlQuestions(int count) {
        List<AtlQuestion> all = questionRepo.findAll();
        Collections.shuffle(all);
        return all.stream().limit(count).collect(Collectors.toList());
    }

    public AtlQuestion getQuestionById(String id) {
        return questionRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Question not found with id: " + id));
    }

    public List<AtlQuestion> getQeustionBySlideId(Long slideId) {
        return questionRepo.findBySlideId(slideId);
    }
}
