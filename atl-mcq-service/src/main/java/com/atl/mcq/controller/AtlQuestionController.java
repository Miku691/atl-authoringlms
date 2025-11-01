package com.atl.mcq.controller;

import com.atl.mcq.entity.AtlQuestion;
import com.atl.mcq.service.AtlQuestionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/questions")
public class AtlQuestionController {
    @Autowired
    private AtlQuestionService atlQuestionService;

    @PostMapping
    public AtlQuestion addAtlQuestion(@RequestBody AtlQuestion atlQuestion) {
        return atlQuestionService.addAtlQuestion(atlQuestion);
    }

    @GetMapping
    public List<AtlQuestion> getAllAtlQuestions() {
        return atlQuestionService.getAllAtlQuestions();
    }

    @GetMapping("/category/{category}")
    public List<AtlQuestion> getByCategory(@PathVariable String category) {
        return atlQuestionService.getByCategory(category);
    }

    @GetMapping("/type/{type}")
    public List<AtlQuestion> getByType(@PathVariable String type) {
        return atlQuestionService.getByType(type);
    }

    @GetMapping("/random/{count}")
    public List<AtlQuestion> getRandom(@PathVariable int count) {
        return atlQuestionService.getRandomAtlQuestions(count);
    }

    @GetMapping("/{id}")
    public AtlQuestion getQuestionById(@PathVariable String id) {
        return atlQuestionService.getQuestionById(id);
    }

    @GetMapping("/slide")
    public List<AtlQuestion> getQuestionBySlideId(@RequestParam Long slideId){
        return atlQuestionService.getQeustionBySlideId(slideId);
    }

}
