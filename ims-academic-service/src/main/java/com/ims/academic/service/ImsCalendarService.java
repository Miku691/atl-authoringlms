package com.ims.academic.service;

import com.ims.academic.dto.CalendarEventDto;
import java.time.LocalDate;
import java.util.List;

public interface ImsCalendarService {
    List<CalendarEventDto> getCalendarEvents(String tenantId, LocalDate startDate, LocalDate endDate, String personId, String role);
}
