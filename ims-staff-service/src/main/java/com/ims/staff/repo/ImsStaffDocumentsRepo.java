package com.ims.staff.repo;

import com.ims.staff.entity.ImsStaffDocuments;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImsStaffDocumentsRepo extends JpaRepository<ImsStaffDocuments, String> {
    List<ImsStaffDocuments> findByStaffId(String staffId);
}
