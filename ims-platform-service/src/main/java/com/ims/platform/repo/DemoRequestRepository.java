package com.ims.platform.repo;

import com.ims.platform.entity.DemoRequest;
import com.ims.platform.enums.DemoRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DemoRequestRepository extends JpaRepository<DemoRequest, String> {
    List<DemoRequest> findAllByOrderByCreatedAtDesc();
    List<DemoRequest> findByStatusOrderByCreatedAtDesc(DemoRequestStatus status);
}
