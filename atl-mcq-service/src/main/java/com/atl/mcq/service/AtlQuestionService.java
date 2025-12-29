package com.atl.mcq.service;

import com.atl.mcq.client.AtlCourseClient;
import com.atl.mcq.dto.AtlSaveQuestionIdDto;
import com.atl.mcq.dto.SlideDto;
import com.atl.mcq.entity.AtlQuestion;
import com.atl.mcq.repo.AtlQuestionRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AtlQuestionService {

    private final AtlQuestionRepo questionRepo;
    private final AtlCourseClient courseClient;

    public AtlQuestion addAtlQuestion(AtlQuestion AtlQuestion) {
        AtlQuestion savedQuestion = questionRepo.save(AtlQuestion);

        courseClient.saveQuestionIdToSlide(AtlSaveQuestionIdDto.builder()
                        .mcqId(savedQuestion.getId())
                        .slide(new SlideDto(AtlQuestion.getSlideId()))
                .build());

        return savedQuestion;
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
