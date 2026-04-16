package com.coliving.admin.dashboard.adapter.in.web.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminDashboardSummaryResponseDto {
    private ContractSummary contract;
    private ReservationSummary reservation;
    private ResidentSummary resident;
    private VisitorSummary visitor;

    @Getter
    @Builder
    public static class ContractSummary {
        private long total;
        private long pending;
        private long active;
        private long expired;
    }

    @Getter
    @Builder
    public static class ReservationSummary {
        private long today;
        private long pending;
        private long total;
    }

    @Getter
    @Builder
    public static class ResidentSummary {
        private long total;
    }

    @Getter
    @Builder
    public static class VisitorSummary {
        private long today;
    }
}
