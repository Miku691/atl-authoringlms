package com.ims.student.service;

import com.ims.student.dto.ImsStudentEnrollmentsDto;

import java.util.List;

public interface ImsStudentEnrollmentsService {
    ImsStudentEnrollmentsDto create(ImsStudentEnrollmentsDto dto);
    ImsStudentEnrollmentsDto update(String id, ImsStudentEnrollmentsDto dto);
    ImsStudentEnrollmentsDto getById(String id);
    List<ImsStudentEnrollmentsDto> getByStudentId(String studentId);
    List<ImsStudentEnrollmentsDto> getAll();
    void delete(String id);
}