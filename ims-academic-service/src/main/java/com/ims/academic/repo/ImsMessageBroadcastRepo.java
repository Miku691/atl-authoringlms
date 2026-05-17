package com.ims.academic.repo;

import com.ims.academic.entity.ImsMessageBroadcast;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImsMessageBroadcastRepo extends JpaRepository<ImsMessageBroadcast, String> {

    List<ImsMessageBroadcast> findByTenantIdOrderBySentAtDesc(String tenantId);

    Page<ImsMessageBroadcast> findByTenantIdOrderBySentAtDesc(String tenantId, Pageable pageable);
}
