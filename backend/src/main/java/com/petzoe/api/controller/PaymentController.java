package com.petzoe.api.controller;

import com.petzoe.api.dto.CreatePaymentRequestDTO;
import com.petzoe.api.dto.CreatePaymentResponseDTO;
import com.petzoe.api.dto.PaymentResponseDTO;
import com.petzoe.api.dto.VerifyPaymentRequestDTO;
import com.petzoe.api.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marketplace/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Initializes payment for an order or directly from the current active cart.
     */
    @PostMapping("/create")
    public ResponseEntity<CreatePaymentResponseDTO> initiatePayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody(required = false) CreatePaymentRequestDTO request) {
        CreatePaymentResponseDTO response = paymentService.initiatePayment(userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    /**
     * Verifies the cryptographic signature received from Razorpay Checkout.
     */
    @PostMapping("/verify")
    public ResponseEntity<PaymentResponseDTO> verifyPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody VerifyPaymentRequestDTO request) {
        PaymentResponseDTO response = paymentService.verifyPayment(userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    /**
     * Explicit cancellation of checkout (e.g. user dismissed checkout modal or aborted).
     */
    @PostMapping("/cancel")
    public ResponseEntity<PaymentResponseDTO> cancelPayment(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        Long orderId = body.get("orderId") != null ? Long.valueOf(body.get("orderId").toString()) : null;
        String reason = (String) body.get("reason");
        if (orderId == null) {
            return ResponseEntity.badRequest().build();
        }
        PaymentResponseDTO response = paymentService.cancelPayment(userDetails.getUsername(), orderId, reason);
        return ResponseEntity.ok(response);
    }

    /**
     * Retrieves payment history for an order.
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<PaymentResponseDTO>> getOrderPayments(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId) {
        List<PaymentResponseDTO> payments = paymentService.getPaymentsForOrder(orderId, userDetails.getUsername());
        return ResponseEntity.ok(payments);
    }

    /**
     * Retrieves all payments for the logged-in user.
     */
    @GetMapping("/my-payments")
    public ResponseEntity<List<PaymentResponseDTO>> getUserPayments(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<PaymentResponseDTO> payments = paymentService.getUserPayments(userDetails.getUsername());
        return ResponseEntity.ok(payments);
    }

    /**
     * Admin view for all platform payments.
     */
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PaymentResponseDTO>> getAllPaymentsAdmin() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }
}
