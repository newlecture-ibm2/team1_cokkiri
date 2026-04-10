package com.coliving.user.contract.adapter.in.web.dto.req;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ContractApplyRequestDto {
    private Long contractId;


    @NotNull(message = "공간 ID는 필수입니다.")
    private Long spaceId;

    @NotNull(message = "입주 희망일은 필수입니다.")
    @FutureOrPresent(message = "입주 희망일은 오늘 이후여야 합니다.")
    private LocalDate desiredStartDate;

    @NotNull(message = "계약 기간은 필수입니다.")
    private Integer desiredDurationMonths;

    @NotBlank(message = "현재 거주지 주소는 필수입니다.")
    private String address;

    @NotBlank(message = "결제 및 반환 계좌 정보는 필수입니다.")
    private String bankAccount;

    @NotBlank(message = "입주 목적을 입력해주세요.")
    private String usagePurpose;

    @NotNull(message = "개인정보 동의는 필수입니다.")
    private Boolean privacyAgreed;

    private String requestNote;
}

