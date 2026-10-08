package com.petzoe.api.dto;

public class CreatePaymentRequestDTO {
    private Long orderId;

    public CreatePaymentRequestDTO() {}

    public CreatePaymentRequestDTO(Long orderId) {
        this.orderId = orderId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }
}
