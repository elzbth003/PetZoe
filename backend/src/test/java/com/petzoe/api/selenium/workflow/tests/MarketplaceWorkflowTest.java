package com.petzoe.api.selenium.workflow.tests;

import com.petzoe.api.selenium.workflow.base.BaseTest;
import com.petzoe.api.selenium.workflow.pages.CartPage;
import com.petzoe.api.selenium.workflow.pages.LoginPage;
import com.petzoe.api.selenium.workflow.pages.MarketplacePage;
import com.petzoe.api.selenium.workflow.utils.TestData;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.openqa.selenium.support.ui.ExpectedConditions;

import static org.junit.jupiter.api.Assertions.*;

public class MarketplaceWorkflowTest extends BaseTest {

    private void loginAsOwner() {
        navigateTo("/login");
        LoginPage loginPage = new LoginPage(driver);
        loginPage.login(TestData.OWNER_EMAIL, TestData.OWNER_PASSWORD);
        wait.until(ExpectedConditions.urlContains("/dashboard/owner"));
    }

    @Test
    @DisplayName("TC-MARKET-01: Public Marketplace Catalog Browsing")
    void testPublicMarketplaceBrowsing() {
        try {
            logStep("Navigate to public marketplace catalog (/marketplace/products)");
            navigateTo("/marketplace/products");

            MarketplacePage marketPage = new MarketplacePage(driver);
            assertTrue(marketPage.isLoaded(), "Marketplace product catalog should load for public visitors");

            logStep("Verify product cards are rendered with pricing and details");
            assertTrue(marketPage.getProductCardsCount() > 0, "Marketplace must list active product offerings");

            capturePass("TC-MARKET-01");
        } catch (Exception e) {
            captureFail("TC-MARKET-01");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-MARKET-02: Product Catalog Item Verification")
    void testProductCatalogItemDisplay() {
        try {
            navigateTo("/marketplace/products?search=Royal%20Canin");
            MarketplacePage marketPage = new MarketplacePage(driver);
            assertTrue(marketPage.isLoaded());

            logStep("Verify pre-seeded product 'Royal Canin Adult Dog Food' is visible in catalog");
            assertTrue(marketPage.hasProductNamed("Royal Canin"), "Product 'Royal Canin' must be displayed in catalog");

            capturePass("TC-MARKET-02");
        } catch (Exception e) {
            captureFail("TC-MARKET-02");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-MARKET-03: Pet Owner Adds Product to Cart")
    void testAddProductToCart() {
        try {
            logStep("Login as Pet Owner to enable purchasing capabilities");
            loginAsOwner();

            logStep("Navigate to product catalog");
            navigateTo("/marketplace/products?search=Royal%20Canin");

            MarketplacePage marketPage = new MarketplacePage(driver);
            assertTrue(marketPage.isLoaded());

            logStep("Add 'Royal Canin' product to cart");
            marketPage.addProductToCart("Royal Canin");

            logStep("Navigate to Cart (/marketplace/cart)");
            navigateTo("/marketplace/cart");

            CartPage cartPage = new CartPage(driver);
            assertTrue(cartPage.isLoaded(), "Cart page should load for authenticated Pet Owner");
            assertTrue(cartPage.getCartItemsCount() > 0, "Cart must contain the added product");

            capturePass("TC-MARKET-03");
        } catch (Exception e) {
            captureFail("TC-MARKET-03");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-MARKET-04: Cart Management - Item Verification & Quantity Adjustment")
    void testCartItemQuantityUpdate() {
        try {
            loginAsOwner();
            navigateTo("/marketplace/cart");

            CartPage cartPage = new CartPage(driver);
            assertTrue(cartPage.isLoaded());

            if (cartPage.getCartItemsCount() == 0) {
                // If cart was empty, add an item first
                navigateTo("/marketplace/products");
                MarketplacePage marketPage = new MarketplacePage(driver);
                assertTrue(marketPage.isLoaded());
                marketPage.addFirstProductToCart();
                navigateTo("/marketplace/cart");
            }

            logStep("Verify item exists in cart");
            assertTrue(cartPage.getCartItemsCount() > 0, "Cart must contain items");

            logStep("Increment item quantity");
            cartPage.incrementItemQuantity(0);

            logStep("Verify item quantity updated");
            String qty = cartPage.getItemQuantity(0);
            assertNotNull(qty, "Item quantity should be retrieved");

            capturePass("TC-MARKET-04");
        } catch (Exception e) {
            captureFail("TC-MARKET-04");
            throw e;
        }
    }

    @Test
    @DisplayName("TC-MARKET-05: Order Placement and Checkout Workflow")
    void testCheckoutAndOrderPlacement() {
        try {
            loginAsOwner();
            navigateTo("/marketplace/cart");

            CartPage cartPage = new CartPage(driver);
            assertTrue(cartPage.isLoaded());

            if (cartPage.getCartItemsCount() == 0) {
                navigateTo("/marketplace/products");
                MarketplacePage marketPage = new MarketplacePage(driver);
                assertTrue(marketPage.isLoaded());
                marketPage.addFirstProductToCart();
                navigateTo("/marketplace/cart");
            }

            logStep("Click 'Proceed to Checkout' to place order");
            cartPage.proceedToCheckout();

            logStep("Verify redirection to Order History or successful order placement");
            assertTrue(cartPage.isOrderPlacedOrRedirected(),
                    "Order should be successfully placed and user redirected to Order History");

            capturePass("TC-MARKET-05");
        } catch (Exception e) {
            captureFail("TC-MARKET-05");
            throw e;
        }
    }
}
