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
import com.razorpay.OrderClient;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private RazorpayClient razorpayClient;

    @InjectMocks
    private PaymentService paymentService;

    private User testUser;
    private Product testProduct;
    private CartItem testCartItem;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(paymentService, "keyId", "rzp_test_sampleKey");
        ReflectionTestUtils.setField(paymentService, "keySecret", "dummySecretKeyForTestingHMAC12345");
        ReflectionTestUtils.setField(paymentService, "currency", "INR");

        testUser = new User();
        testUser.setId(101L);
        testUser.setEmail("owner@petzoe.com");
        testUser.setName("Alex PetLover");
        testUser.setPhone("9876543210");

        testProduct = new Product();
        testProduct.setId(501L);
        testProduct.setName("Premium Organic Dog Food");
        testProduct.setPrice(1200.0);
        testProduct.setDiscountPrice(999.0);
        testProduct.setStockQuantity(25);

        testCartItem = new CartItem(2, testUser, testProduct);
        testCartItem.setId(901L);
    }

    @Test
    void testInitiatePaymentFromCart_CalculatesCorrectPaiseAndLocksStock() throws Exception {
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
        when(cartItemRepository.findByUser(testUser)).thenReturn(Collections.singletonList(testCartItem));
        when(productRepository.findByIdForUpdate(testProduct.getId())).thenReturn(Optional.of(testProduct));

        com.petzoe.api.entity.Order savedOrder = new com.petzoe.api.entity.Order();
        savedOrder.setId(777L);
        savedOrder.setUser(testUser);
        savedOrder.setTotalAmount(1998.0); // 2 * 999.0
        when(orderRepository.save(any(com.petzoe.api.entity.Order.class))).thenReturn(savedOrder);

        // Mock Razorpay OrderClient
        OrderClient mockOrderClient = mock(OrderClient.class);
        ReflectionTestUtils.setField(razorpayClient, "orders", mockOrderClient);

        JSONObject rzpOrderJson = new JSONObject();
        rzpOrderJson.put("id", "order_rzp_mock_123");
        rzpOrderJson.put("amount", 199800);
        rzpOrderJson.put("currency", "INR");
        Order mockRzpOrder = new Order(rzpOrderJson);

        when(mockOrderClient.create(any(JSONObject.class))).thenReturn(mockRzpOrder);

        Payment savedPayment = new Payment();
        savedPayment.setId(333L);
        savedPayment.setRazorpayOrderId("order_rzp_mock_123");
        savedPayment.setAmount(BigDecimal.valueOf(1998.0));
        savedPayment.setAmountInPaise(199800L);
        savedPayment.setOrder(savedOrder);
        savedPayment.setUser(testUser);
        when(paymentRepository.save(any(Payment.class))).thenReturn(savedPayment);

        CreatePaymentResponseDTO response = paymentService.initiatePayment(testUser.getEmail(), null);

        assertNotNull(response);
        assertEquals(777L, response.getOrderId());
        assertEquals("order_rzp_mock_123", response.getRazorpayOrderId());
        assertEquals(199800L, response.getAmountInPaise());
        assertEquals(1998.0, response.getAmount());
        assertEquals("rzp_test_sampleKey", response.getKeyId());
        // Verify reserved stock was decreased
        assertEquals(23, testProduct.getStockQuantity());
        // Verify cart was cleared
        verify(cartItemRepository, times(1)).deleteByUser(testUser);
    }

    @Test
    void testVerifyPayment_InvalidSignature_ThrowsExceptionAndMarksFailed() {
        Payment mockPayment = new Payment();
        mockPayment.setId(1L);
        mockPayment.setUser(testUser);
        mockPayment.setRazorpayOrderId("order_mock_999");
        mockPayment.setStatus(PaymentStatus.CREATED);

        com.petzoe.api.entity.Order mockOrder = new com.petzoe.api.entity.Order();
        mockOrder.setId(50L);
        mockPayment.setOrder(mockOrder);

        when(paymentRepository.findByRazorpayOrderId("order_mock_999")).thenReturn(Optional.of(mockPayment));

        VerifyPaymentRequestDTO req = new VerifyPaymentRequestDTO();
        req.setOrderId(50L);
        req.setRazorpayOrderId("order_mock_999");
        req.setRazorpayPaymentId("pay_mock_111");
        req.setRazorpaySignature("invalid_forged_signature_hash");

        assertThrows(IllegalArgumentException.class, () -> {
            paymentService.verifyPayment(testUser.getEmail(), req);
        });

        assertEquals(PaymentStatus.FAILED, mockPayment.getStatus());
        assertEquals("Cryptographic signature mismatch", mockPayment.getFailureReason());
        assertEquals("Payment Failed", mockOrder.getStatus());
    }

    @Test
    void testCancelPayment_RestoresStockIdempotently() {
        com.petzoe.api.entity.Order mockOrder = new com.petzoe.api.entity.Order();
        mockOrder.setId(42L);
        mockOrder.setUser(testUser);
        mockOrder.setStatus("Pending Payment");

        testProduct.setStockQuantity(10); // currently 10 after reservation
        OrderItem item = new OrderItem(3, 999.0, mockOrder, testProduct);
        mockOrder.getItems().add(item);

        when(orderRepository.findById(42L)).thenReturn(Optional.of(mockOrder));
        when(productRepository.findById(testProduct.getId())).thenReturn(Optional.of(testProduct));

        Payment payment = new Payment();
        payment.setId(88L);
        payment.setOrder(mockOrder);
        payment.setUser(testUser);
        payment.setStatus(PaymentStatus.CREATED);
        payment.setInventoryRestored(false);

        when(paymentRepository.findByOrderId(42L)).thenReturn(Collections.singletonList(payment));

        PaymentResponseDTO res = paymentService.cancelPayment(testUser.getEmail(), 42L, "User changed mind");

        assertNotNull(res);
        assertEquals(PaymentStatus.CANCELLED, payment.getStatus());
        assertTrue(payment.isInventoryRestored());
        assertEquals(13, testProduct.getStockQuantity()); // 10 + 3 restored!
        assertEquals("Cancelled", mockOrder.getStatus());

        // Call again to verify idempotency
        paymentService.cancelPayment(testUser.getEmail(), 42L, "Repeat call");
        assertEquals(13, testProduct.getStockQuantity()); // Not added again!
    }

    @Test
    void testProcessWebhookEvent_PaymentCaptured_UpdatesStatusToSuccess() {
        ReflectionTestUtils.setField(paymentService, "webhookSecret", "dummyWebhookSecret123");

        com.petzoe.api.entity.Order mockOrder = new com.petzoe.api.entity.Order();
        mockOrder.setId(10L);
        mockOrder.setUser(testUser);
        mockOrder.setStatus("Pending Payment");

        Payment payment = new Payment();
        payment.setId(99L);
        payment.setOrder(mockOrder);
        payment.setUser(testUser);
        payment.setRazorpayOrderId("order_rzp_hook_123");
        payment.setStatus(PaymentStatus.CREATED);

        when(paymentRepository.findByRazorpayOrderId("order_rzp_hook_123")).thenReturn(Optional.of(payment));

        String rawPayload = "{"
                + "\"event\":\"payment.captured\","
                + "\"payload\":{"
                + "  \"payment\":{"
                + "    \"entity\":{"
                + "      \"id\":\"pay_rzp_hook_999\","
                + "      \"order_id\":\"order_rzp_hook_123\","
                + "      \"method\":\"upi\""
                + "    }"
                + "  }"
                + "}"
                + "}";

        // Calculate expected HMAC SHA-256 for dummyWebhookSecret123
        String signature;
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec("dummyWebhookSecret123".getBytes(java.nio.charset.StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(rawPayload.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            signature = hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        paymentService.processWebhookEvent(rawPayload, signature);

        assertEquals(PaymentStatus.SUCCESS, payment.getStatus());
        assertEquals("pay_rzp_hook_999", payment.getRazorpayPaymentId());
        assertEquals(PaymentMethod.UPI, payment.getMethod());
        assertEquals("Processing", mockOrder.getStatus());
        verify(paymentRepository, times(1)).save(payment);
        verify(orderRepository, times(1)).save(mockOrder);
    }

    @Test
    void testProcessWebhookEvent_InvalidSignature_ThrowsException() {
        ReflectionTestUtils.setField(paymentService, "webhookSecret", "dummyWebhookSecret123");

        String rawPayload = "{\"event\":\"payment.captured\"}";
        String invalidSignature = "invalid_hash_value_12345";

        assertThrows(IllegalArgumentException.class, () -> {
            paymentService.processWebhookEvent(rawPayload, invalidSignature);
        });
    }
}
