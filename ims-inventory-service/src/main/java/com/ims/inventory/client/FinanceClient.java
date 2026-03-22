package com.ims.inventory.client;

import com.ims.inventory.dto.external.ExternalExpenseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "ims-finance-service")
public interface FinanceClient {

    @PostMapping("/api/v1/finance/expenses")
    ResponseEntity<Map<String, Object>> recordExpense(@RequestBody ExternalExpenseDTO dto);
}
