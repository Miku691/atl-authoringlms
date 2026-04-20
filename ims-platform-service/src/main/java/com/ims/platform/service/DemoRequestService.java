package com.ims.platform.service;

import com.ims.platform.dto.DemoRequestDto;
import com.ims.platform.enums.DemoRequestStatus;

import java.util.List;

public interface DemoRequestService {
    DemoRequestDto submitRequest(DemoRequestDto requestDto);
    List<DemoRequestDto> getAllRequests();
    DemoRequestDto updateStatus(String id, DemoRequestStatus status, String feedback);
    DemoRequestDto confirmMeeting(String id, String meetingLink);
}
