package com.ims.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CollectionSummaryDTO {
    private BigDecimal todayCollection;
    private BigDecimal monthCollection;
    private BigDecimal yearCollection;
    private Map<String, BigDecimal> collectionByOffering; // OfferingId -> Amount
    private Map<String, String> offeringNames; // OfferingId -> Name
    private List<TransactionDTO> recentTransactions;
    private BigDecimal pendingReceivables;
    private List<Map<String, Object>> monthlyTrend;
    private List<Map<String, Object>> feeDistribution;
    private List<Map<String, Object>> annualFeeSummary;
}

