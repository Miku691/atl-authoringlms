package com.atl.mcq.repo;

import com.atl.mcq.entity.AtlQuestion;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface AtlQuestionRepo extends MongoRepository<AtlQuestion, String> {
    List<AtlQuestion> findByCategory(String category);
    List<AtlQuestion> findByType(String type);

    List<AtlQuestion> findBySlideId(Long slideId);
}
