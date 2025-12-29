package com.ims.student.service;

import com.ims.student.dto.ImsStudentGuardiansDto;

import java.util.List;

public interface ImsStudentGuardiansService {
    ImsStudentGuardiansDto create(ImsStudentGuardiansDto dto);
    ImsStudentGuardiansDto update(String id, ImsStudentGuardiansDto dto);
    ImsStudentGuardiansDto getById(String id);
    List<ImsStudentGuardiansDto> getByStudentId(String studentId);
    List<ImsStudentGuardiansDto> getAll();
    void delete(String id);
}
