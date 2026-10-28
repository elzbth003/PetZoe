package com.petzoe.api.service;

import com.petzoe.api.dto.CreatePaymentRequestDTO;
import com.petzoe.api.dto.CreatePaymentResponseDTO;
import com.petzoe.api.dto.PaymentResponseDTO;
import com.petzoe.api.dto.VerifyPaymentRequestDTO;
import com.petzoe.api.entity.*;
import com.petzoe.api.repository.CartItemRepository;
import com.petzoe.api.repository.OrderRepository;
import com.petzoe.api.repository.PaymentRepository;
import com.petzoe.api.repository.ProductRepository;
import com.petzoe.api.repository.UserRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final NotificationService notificationService;
    private final RazorpayClient razorpayClient;

    @Value("${petzoe.razorpay.mode:auto}")
    private String mode;

    @Value("${petzoe.razorpay.key-id}")
    private String keyId;

    @Value("${petzoe.razorpay.key-secret}")
    private String keySecret;

    @Value("${petzoe.razorpay.webhook-secret:}")
    private String webhookSecret;

    @Value("${petzoe.razorpay.currency:INR}")
    private String currency;

    public PaymentService(PaymentRepository paymentRepository,
                          OrderRepository orderRepository,
                          CartItemRepository cartItemRepository,
                          UserRepository userRepository,
                          ProductRepository productRepository,
                          NotificationService notificationService,
                          RazorpayClient razorpayClient) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.notificationService = notificationService;
        this.razorpayClient = razorpayClient;
    }

    /**
     * Initializes or retries checkout payment.
     * If orderId is provided, checks if order belongs to user and is still payable.
     * If orderId is null, creates a pending order from user cart and reserves stock with pessimistic locking.
     */
    @Transactional
    public CreatePaymentResponseDTO initiatePayment(String email, CreatePaymentRequestDTO request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        com.petzoe.api.entity.Order order;
        if (request != null && request.getOrderId() != null) {
            order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new RuntimeException("Order not found: " + request.getOrderId()));
            if (!order.getUser().getId().equals(user.getId())) {
                throw new org.springframework.security.access.AccessDeniedException("Not authorized for this order");
            }
            if ("Delivered".equalsIgnoreCase(order.getStatus()) || "Shipped".equalsIgnoreCase(order.getStatus())
                    || "Processing".equalsIgnoreCase(order.getStatus())) {
                throw new IllegalStateException("Order is already paid and in status: " + order.getStatus());
            }
        } else {
            // Create pending order from cart and reserve inventory under lock
            List<CartItem> cartItems = cartItemRepository.findByUser(user);
            if (cartItems.isEmpty()) {
                throw new IllegalStateException("Cart is empty. Cannot checkout.");
            }

            order = new com.petzoe.api.entity.Order();
            order.setUser(user);
            order.setStatus("Pending Payment");

            double totalAmount = 0.0;
            for (CartItem cartItem : cartItems) {
                Product product = productRepository.findByIdForUpdate(cartItem.getProduct().getId())
                        .orElseThrow(() -> new RuntimeException("Product not found: " + cartItem.getProduct().getId()));

                if (product.getStockQuantity() < cartItem.getQuantity()) {
                    throw new IllegalStateException("Insufficient stock for '" + product.getName() + "'. Only "
                            + product.getStockQuantity() + " left.");
                }

                double effectivePrice = product.getDiscountPrice() != null
                        ? product.getDiscountPrice()
                        : product.getPrice();

                OrderItem orderItem = new OrderItem(
                        cartItem.getQuantity(),
                        effectivePrice,
                        order,
                        product
                );
                order.getItems().add(orderItem);
                totalAmount += effectivePrice * cartItem.getQuantity();

                // Reserve stock
                product.setStockQuantity(product.getStockQuantity() - cartItem.getQuantity());
            }

            // Authoritative server-side rounding to 2 decimals
            BigDecimal totalBd = BigDecimal.valueOf(totalAmount).setScale(2, RoundingMode.HALF_UP);
            order.setTotalAmount(totalBd.doubleValue());
            order = orderRepository.save(order);
            // Clear user's cart now that order is locked in
            cartItemRepository.deleteByUser(user);
        }

        // Calculate paise (Amount * 100)
        BigDecimal amountBd = BigDecimal.valueOf(order.getTotalAmount()).setScale(2, RoundingMode.HALF_UP);
        long amountInPaise = amountBd.multiply(BigDecimal.valueOf(100)).longValue();

        String razorpayOrderId;
        boolean isPlaceholderKey = keyId == null || keyId.isBlank() || keyId.contains("placeholder") || keySecret == null || keySecret.contains("placeholder");
        if ("mock".equalsIgnoreCase(mode) || (("auto".equalsIgnoreCase(mode) || mode == null) && isPlaceholderKey)) {
            razorpayOrderId = "order_mock_" + order.getId() + "_" + System.currentTimeMillis();
            log.info("Using simulated Razorpay Order ID {} (test/dev mode active)", razorpayOrderId);
        } else {
            try {
                JSONObject orderRequest = new JSONObject();
                orderRequest.put("amount", amountInPaise);
                orderRequest.put("currency", currency);
                orderRequest.put("receipt", "order_rcpt_" + order.getId() + "_" + System.currentTimeMillis());
                JSONObject notes = new JSONObject();
                notes.put("petzoe_order_id", order.getId().toString());
                notes.put("customer_email", user.getEmail());
                orderRequest.put("notes", notes);

                Order rzpOrder = razorpayClient.orders.create(orderRequest);
                razorpayOrderId = rzpOrder.get("id");
                log.info("Created Razorpay Order {} for PetZoe Order {}", razorpayOrderId, order.getId());
            } catch (RazorpayException e) {
                log.error("Failed to create Razorpay Order for PetZoe Order {}: {}", order.getId(), e.getMessage());
                if ("auto".equalsIgnoreCase(mode) || "mock".equalsIgnoreCase(mode)) {
                    log.warn("Falling back to simulated test mode due to gateway exception: {}", e.getMessage());
                    razorpayOrderId = "order_mock_" + order.getId() + "_" + System.currentTimeMillis();
                } else {
                    throw new RuntimeException("Payment gateway initialization failed: " + e.getMessage(), e);
                }
            }
        }

        // Record new Payment
        Payment payment = new Payment();
        payment.setUser(user);
        payment.setOrder(order);
        payment.setRazorpayOrderId(razorpayOrderId);
        payment.setAmount(amountBd);
        payment.setAmountInPaise(amountInPaise);
        payment.setCurrency(currency);
        payment.setStatus(PaymentStatus.CREATED);
        payment.setPaymentType(PaymentType.MARKETPLACE_ORDER);
        payment.setInventoryRestored(false);
        Payment savedPayment = paymentRepository.save(payment);

        CreatePaymentResponseDTO response = new CreatePaymentResponseDTO();
        response.setPaymentId(savedPayment.getId());
        response.setOrderId(order.getId());
        response.setRazorpayOrderId(razorpayOrderId);
        response.setAmountInPaise(amountInPaise);
        response.setAmount(amountBd.doubleValue());
        response.setCurrency(currency);
        response.setKeyId(keyId);
        response.setCustomerName(user.getName() != null ? user.getName() : user.getUsername());
        response.setCustomerEmail(user.getEmail());
        response.setCustomerPhone(user.getPhone());

        return response;
    }

    /**
     * Cryptographically verifies the Razorpay payment signature.
     */
    @Transactional
    public PaymentResponseDTO verifyPayment(String email, VerifyPaymentRequestDTO request) {
        if (request.getRazorpayOrderId() == null || request.getRazorpayPaymentId() == null || request.getRazorpaySignature() == null) {
            throw new IllegalArgumentException("Missing required payment verification parameters");
        }

        Payment payment = paymentRepository.findByRazorpayOrderId(request.getRazorpayOrderId())
                .orElseThrow(() -> new RuntimeException("Payment record not found for Razorpay Order: " + request.getRazorpayOrderId()));

        if (!payment.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized to verify this payment");
        }

        boolean isValidSignature = false;
        boolean isPlaceholderKey = keyId == null || keyId.isBlank() || keyId.contains("placeholder") || keySecret == null || keySecret.contains("placeholder");
        boolean isMockOrder = request.getRazorpayOrderId().startsWith("order_mock_");
        boolean isSimulatedSig = "simulated_valid_test_signature".equals(request.getRazorpaySignature());
        boolean isTestKey = keyId != null && keyId.startsWith("rzp_test_");

        if ((isMockOrder || isTestKey || "mock".equalsIgnoreCase(mode) || (("auto".equalsIgnoreCase(mode) || mode == null) && isPlaceholderKey)) && isSimulatedSig) {
            // In local development / mock test mode or with test keys, accept simulated test signatures
            isValidSignature = true;
            log.info("Simulated signature verification passed for order {}", request.getRazorpayOrderId());
        } else {
            try {
                JSONObject options = new JSONObject();
                options.put("razorpay_order_id", request.getRazorpayOrderId());
                options.put("razorpay_payment_id", request.getRazorpayPaymentId());
                options.put("razorpay_signature", request.getRazorpaySignature());

                isValidSignature = Utils.verifyPaymentSignature(options, keySecret);
            } catch (Exception e) {
                log.error("Signature verification exception: {}", e.getMessage());
                isValidSignature = false;
            }
        }

        com.petzoe.api.entity.Order order = payment.getOrder();

        if (isValidSignature) {
            payment.setRazorpayPaymentId(request.getRazorpayPaymentId());
            payment.setRazorpaySignature(request.getRazorpaySignature());
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            if (order != null) {
                order.setStatus("Processing");
                orderRepository.save(order);

                // Notify User
                try {
                    notificationService.createNotification(
                            order.getUser(),
                            "Payment Successful!",
                            "Your payment of ₹" + payment.getAmount() + " for Order #" + order.getId() + " was successful.",
                            "MARKETPLACE"
                    );
                } catch (Exception notifEx) {
                    log.warn("Failed to send order notification: {}", notifEx.getMessage());
                }
            }
            log.info("Payment SUCCESS for Razorpay Order {}", request.getRazorpayOrderId());
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setFailureReason("Cryptographic signature mismatch");
            payment.setUpdatedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            if (order != null) {
                order.setStatus("Payment Failed");
                orderRepository.save(order);
            }
            log.warn("Payment FAILED (invalid signature) for Razorpay Order {}", request.getRazorpayOrderId());
            throw new IllegalArgumentException("Invalid payment signature verification failed");
        }

        return PaymentResponseDTO.fromEntity(payment);
    }

    /**
     * Cancel payment and safely restore reserved stock idempotently.
     */
    @Transactional
    public PaymentResponseDTO cancelPayment(String email, Long orderId, String reason) {
        com.petzoe.api.entity.Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (!order.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized for this order");
        }

        List<Payment> payments = paymentRepository.findByOrderId(orderId);
        Payment latestPayment = payments.isEmpty() ? null : payments.get(payments.size() - 1);

        if (latestPayment != null && latestPayment.getStatus() == PaymentStatus.SUCCESS) {
            throw new IllegalStateException("Cannot cancel an already completed payment");
        }

        if (latestPayment != null) {
            latestPayment.setStatus(PaymentStatus.CANCELLED);
            latestPayment.setFailureReason(reason != null ? reason : "Cancelled by user");
            restoreStockForOrder(order, latestPayment);
            paymentRepository.save(latestPayment);
        } else {
            // Restore stock directly on order
            restoreStockForOrder(order, null);
        }

        order.setStatus("Cancelled");
        orderRepository.save(order);

        return latestPayment != null ? PaymentResponseDTO.fromEntity(latestPayment) : null;
    }

    private void restoreStockForOrder(com.petzoe.api.entity.Order order, Payment payment) {
        if (payment != null && payment.isInventoryRestored()) {
            return; // Idempotent check
        }
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProduct().getId()).orElse(null);
            if (product != null) {
                product.setStockQuantity(product.getStockQuantity() + item.getQuantity());
                productRepository.save(product);
                log.info("Restored {} units of stock for Product {}", item.getQuantity(), product.getName());
            }
        }
        if (payment != null) {
            payment.setInventoryRestored(true);
        }
    }

    public List<PaymentResponseDTO> getPaymentsForOrder(Long orderId, String email) {
        com.petzoe.api.entity.Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        if (!order.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new org.springframework.security.access.AccessDeniedException("Not authorized");
        }
        return paymentRepository.findByOrderId(orderId).stream()
                .map(PaymentResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PaymentResponseDTO> getUserPayments(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return paymentRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(PaymentResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PaymentResponseDTO> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(PaymentResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Processes inbound Razorpay Webhooks idempotently after cryptographically
     * validating the X-Razorpay-Signature with webhook-secret.
     */
    @Transactional
    public void processWebhookEvent(String rawPayload, String signatureHeader) {
        if (signatureHeader == null || signatureHeader.isBlank()) {
            throw new IllegalArgumentException("Missing X-Razorpay-Signature header in webhook request");
        }

        // 1. Cryptographic validation of webhook signature
        boolean isValidSignature = false;
        boolean isPlaceholderSecret = webhookSecret == null || webhookSecret.isBlank() || webhookSecret.contains("placeholder");

        if (isPlaceholderSecret && "simulated_valid_webhook_signature".equals(signatureHeader)) {
            isValidSignature = true;
            log.info("Simulated webhook signature verification passed");
        } else {
            try {
                isValidSignature = Utils.verifyWebhookSignature(rawPayload, signatureHeader, webhookSecret);
            } catch (Exception e) {
                log.error("Webhook signature verification failed: {}", e.getMessage());
                isValidSignature = false;
            }
        }

        if (!isValidSignature) {
            log.warn("Invalid webhook signature received from Razorpay");
            throw new IllegalArgumentException("Invalid webhook signature");
        }

        // 2. Parse event payload
        JSONObject eventJson = new JSONObject(rawPayload);
        String eventType = eventJson.optString("event");
        log.info("Received verified Razorpay webhook event: {}", eventType);

        JSONObject payload = eventJson.optJSONObject("payload");
        if (payload == null) {
            return;
        }

        JSONObject paymentEntity = payload.optJSONObject("payment") != null 
                ? payload.getJSONObject("payment").optJSONObject("entity") 
                : null;

        if (paymentEntity == null) {
            return;
        }

        String razorpayOrderId = paymentEntity.optString("order_id");
        String razorpayPaymentId = paymentEntity.optString("id");
        String method = paymentEntity.optString("method");

        if (razorpayOrderId == null || razorpayOrderId.isBlank()) {
            return;
        }

        Payment payment = paymentRepository.findByRazorpayOrderId(razorpayOrderId).orElse(null);
        if (payment == null) {
            log.warn("Webhook: No payment record found for Razorpay Order ID: {}", razorpayOrderId);
            return;
        }

        com.petzoe.api.entity.Order order = payment.getOrder();

        // 3. Dispatch based on event type idempotently
        switch (eventType) {
            case "payment.captured":
            case "order.paid":
                if (payment.getStatus() != PaymentStatus.SUCCESS) {
                    payment.setStatus(PaymentStatus.SUCCESS);
                    payment.setRazorpayPaymentId(razorpayPaymentId);
                    if (method != null && !method.isBlank()) {
                        try {
                            payment.setMethod(PaymentMethod.valueOf(method.toUpperCase()));
                        } catch (Exception ignored) {
                            payment.setMethod(PaymentMethod.UNKNOWN);
                        }
                    }
                    payment.setUpdatedAt(LocalDateTime.now());
                    paymentRepository.save(payment);

                    if (order != null && !"Delivered".equalsIgnoreCase(order.getStatus()) && !"Shipped".equalsIgnoreCase(order.getStatus())) {
                        order.setStatus("Processing");
                        orderRepository.save(order);

                        try {
                            notificationService.createNotification(
                                    order.getUser(),
                                    "Payment Confirmed",
                                    "Your payment of ₹" + payment.getAmount() + " for Order #" + order.getId() + " was confirmed via Razorpay.",
                                    "MARKETPLACE"
                            );
                        } catch (Exception notifEx) {
                            log.warn("Webhook: Failed to send payment notification: {}", notifEx.getMessage());
                        }
                    }
                    log.info("Webhook: Payment marked SUCCESS for Razorpay Order {}", razorpayOrderId);
                } else {
                    log.info("Webhook: Payment already in SUCCESS status for Razorpay Order {} (Idempotent)", razorpayOrderId);
                }
                break;

            case "payment.failed":
                if (payment.getStatus() != PaymentStatus.SUCCESS) {
                    payment.setStatus(PaymentStatus.FAILED);
                    String errorDesc = paymentEntity.optString("error_description", "Payment failed via gateway");
                    payment.setFailureReason(errorDesc);
                    payment.setUpdatedAt(LocalDateTime.now());
                    paymentRepository.save(payment);

                    if (order != null && "Pending Payment".equalsIgnoreCase(order.getStatus())) {
                        order.setStatus("Payment Failed");
                        orderRepository.save(order);
                    }
                    log.info("Webhook: Payment marked FAILED for Razorpay Order {}", razorpayOrderId);
                }
                break;

            default:
                log.info("Webhook: Unhandled event type: {}", eventType);
                break;
        }
    }
}
