package com.coliving.resident.payment.adapter.out.remote;

import com.coliving.resident.payment.application.port.out.PortOneVerificationPort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Slf4j
@Component
public class PortOneAdapter implements PortOneVerificationPort {

    @Override
    public BigDecimal getPaidAmount(String portonePaymentId) {
        log.info("[PortOneAdapter] Verifying payment for PortOne ID: {}", portonePaymentId);
        
        // Mock verification: Always return the amount for demo if ID is "test_ok"
        // In reality, this would be a RestTemplate call to PortOne API
        if (portonePaymentId.startsWith("test_")) {
            // For testing, extract amount from suffix if dummy like test_50000
            String suffix = portonePaymentId.substring(5);
            try {
                return new BigDecimal(suffix);
            } catch (NumberFormatException e) {
                return BigDecimal.valueOf(50000); // default
            }
        }
        
        return BigDecimal.ZERO; 
    }
}
