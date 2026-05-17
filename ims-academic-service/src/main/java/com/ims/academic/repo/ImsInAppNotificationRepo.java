package com.ims.academic.repo;

import com.ims.academic.entity.ImsInAppNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImsInAppNotificationRepo extends JpaRepository<ImsInAppNotification, String> {

    List<ImsInAppNotification> findByRecipientUserIdAndTenantIdOrderByCreatedAtDesc(String recipientUserId, String tenantId);

    List<ImsInAppNotification> findByRecipientUserIdAndTenantIdAndIsReadFalseOrderByCreatedAtDesc(String recipientUserId, String tenantId);
}
