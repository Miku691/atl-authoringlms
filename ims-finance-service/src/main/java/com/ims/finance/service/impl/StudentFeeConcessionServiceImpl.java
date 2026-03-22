package com.ims.finance.service.impl;

import com.ims.finance.dto.StudentFeeConcessionDTO;
import com.ims.finance.entity.StudentFeeConcession;
import com.ims.finance.exception.ResourceNotFoundException;
import com.ims.finance.repository.StudentFeeConcessionRepository;
import com.ims.finance.service.StudentFeeConcessionService;
import com.ims.finance.util.SecurityUtils;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentFeeConcessionServiceImpl implements StudentFeeConcessionService {

    private final StudentFeeConcessionRepository concessionRepository;
    private final ModelMapper modelMapper;

    public StudentFeeConcessionServiceImpl(StudentFeeConcessionRepository concessionRepository, ModelMapper modelMapper) {
        this.concessionRepository = concessionRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public StudentFeeConcessionDTO grantConcession(StudentFeeConcessionDTO request) {
        StudentFeeConcession concession = modelMapper.map(request, StudentFeeConcession.class);
        concession.setTenantId(SecurityUtils.getCurrentTenantId());
        
        if (concession.getStatus() == null || concession.getStatus().isEmpty()) {
            concession.setStatus("ACTIVE");
        }
        
        StudentFeeConcession saved = concessionRepository.save(concession);
        return modelMapper.map(saved, StudentFeeConcessionDTO.class);
    }

    @Override
    public List<StudentFeeConcessionDTO> getConcessionsByStudent(String studentId) {
        String tenantId = SecurityUtils.getCurrentTenantId();
        return concessionRepository.findByStudentIdAndTenantId(studentId, tenantId).stream()
                .map(c -> modelMapper.map(c, StudentFeeConcessionDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public List<StudentFeeConcessionDTO> getActiveConcessionsByStudentAndYear(String studentId, String academicYear) {
        String tenantId = SecurityUtils.getCurrentTenantId();
        return concessionRepository.findByStudentIdAndAcademicYearAndTenantId(studentId, academicYear, tenantId).stream()
                .filter(c -> "ACTIVE".equalsIgnoreCase(c.getStatus()))
                .map(c -> modelMapper.map(c, StudentFeeConcessionDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public StudentFeeConcessionDTO updateConcessionStatus(String id, String status) {
        StudentFeeConcession concession = concessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("id", id));
                
        concession.setStatus(status);
        StudentFeeConcession updated = concessionRepository.save(concession);
        return modelMapper.map(updated, StudentFeeConcessionDTO.class);
    }

    @Override
    public void revokeConcession(String id) {
        updateConcessionStatus(id, "REVOKED");
    }
}
