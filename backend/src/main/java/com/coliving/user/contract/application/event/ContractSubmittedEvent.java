package com.coliving.user.contract.application.event;

import com.coliving.user.contract.model.Contract;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class ContractSubmittedEvent {
    private final Contract contract;
}
