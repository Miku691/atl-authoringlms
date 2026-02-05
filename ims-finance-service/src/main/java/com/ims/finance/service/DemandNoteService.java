package com.ims.finance.service;

import com.ims.finance.dto.DemandNoteDTO;
import java.util.List;

public interface DemandNoteService {
    DemandNoteDTO createDemandNote(DemandNoteDTO dto);

    List<DemandNoteDTO> getStudentDemandNotes(String studentId);

    DemandNoteDTO updateDemandNoteStatus(String id, String status);

    void deleteDemandNote(String id);
}
