package com.ims.finance.service.impl;

import com.ims.finance.dto.DemandNoteDTO;
import com.ims.finance.entity.DemandNote;
import com.ims.finance.exception.ResourceNotFoundException;
import com.ims.finance.repository.DemandNoteRepository;
import com.ims.finance.service.DemandNoteService;
import com.ims.finance.util.SecurityUtils;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DemandNoteServiceImpl implements DemandNoteService {

    private final DemandNoteRepository demandNoteRepository;
    private final ModelMapper modelMapper;

    public DemandNoteServiceImpl(DemandNoteRepository demandNoteRepository, ModelMapper modelMapper) {
        this.demandNoteRepository = demandNoteRepository;
        this.modelMapper = modelMapper;
    }

    @Override
    public DemandNoteDTO createDemandNote(DemandNoteDTO dto) {
        DemandNote demandNote = modelMapper.map(dto, DemandNote.class);
        demandNote.setTenantId(SecurityUtils.getCurrentTenantId());
        demandNote.setStatus(DemandNote.DemandStatus.PENDING);
        demandNote.setAmountPaid(java.math.BigDecimal.ZERO);
        demandNote.setBalance(demandNote.getAmount());

        DemandNote saved = demandNoteRepository.save(demandNote);
        return modelMapper.map(saved, DemandNoteDTO.class);
    }

    @Override
    public List<DemandNoteDTO> getStudentDemandNotes(String studentId) {
        String tenantId = SecurityUtils.getCurrentTenantId();
        return demandNoteRepository.findAllByStudentIdAndTenantId(studentId, tenantId)
                .stream()
                .map(note -> modelMapper.map(note, DemandNoteDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    public DemandNoteDTO updateDemandNoteStatus(String id, String status) {
        DemandNote note = demandNoteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DemandNote", id));

        note.setStatus(DemandNote.DemandStatus.valueOf(status));
        DemandNote updated = demandNoteRepository.save(note);
        return modelMapper.map(updated, DemandNoteDTO.class);
    }

    @Override
    public void deleteDemandNote(String id) {
        demandNoteRepository.deleteById(id);
    }
}
