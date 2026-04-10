package com.coliving.admin.contract.adapter.in.web.dto.req;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class AdminUpdateContractRequestDto {

    @NotNull(message = "시작일은 필수입니다.")
    private LocalDate startDate;

    @NotNull(message = "종료일은 필수입니다.")
    private LocalDate endDate;

    @NotNull(message = "월세는 필수입니다.")
    private BigDecimal monthlyRent;

    @NotNull(message = "보증금은 필수입니다.")
    private BigDecimal deposit;

    private String specialTerms;
}
