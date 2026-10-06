package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class ChatbotPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By toggleButton = By.cssSelector("[data-testid='chatbot-toggle']");
    private final By chatbotWindow = By.cssSelector("[data-testid='chatbot-window']");
    private final By closeButton = By.cssSelector("[data-testid='chatbot-close']");
    private final By newConversationButton = By.cssSelector("[data-testid='chat-new-conversation']");
    private final By messageInput = By.cssSelector("[data-testid='chat-message-input']");
    private final By sendButton = By.cssSelector("[data-testid='chat-send']");
    private final By messages = By.cssSelector("[data-testid='chat-message']");
    private final By loadingIndicator = By.cssSelector("[data-testid='chat-loading']");
    private final By errorBanner = By.cssSelector("[data-testid='chat-error']");
    private final By webSearchStatus = By.cssSelector("[data-testid='chat-web-search-status']");
    private final By sourcesSection = By.cssSelector("[data-testid='chat-sources']");
    private final By sourceCards = By.cssSelector("[data-testid='chat-source']");
    private final By sourceLinks = By.cssSelector("[data-testid='chat-source-link']");

    public ChatbotPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isTogglePresent() {
        try {
            return wait.until(ExpectedConditions.presenceOfElementLocated(toggleButton)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void openChatbot() {
        if (!isOpen()) {
            WebElement toggle = wait.until(ExpectedConditions.presenceOfElementLocated(toggleButton));
            try {
                wait.until(ExpectedConditions.elementToBeClickable(toggle)).click();
            } catch (Exception e) {
                ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", toggle);
            }
            wait.until(ExpectedConditions.visibilityOfElementLocated(chatbotWindow));
        }
    }

    public void closeChatbot() {
        if (isOpen()) {
            WebElement close = wait.until(ExpectedConditions.presenceOfElementLocated(closeButton));
            try {
                wait.until(ExpectedConditions.elementToBeClickable(close)).click();
            } catch (Exception e) {
                ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", close);
            }
            wait.until(ExpectedConditions.invisibilityOfElementLocated(chatbotWindow));
        }
    }

    public boolean isOpen() {
        try {
            List<WebElement> elements = driver.findElements(chatbotWindow);
            return !elements.isEmpty() && elements.getFirst().isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void sendMessage(String message) {
        openChatbot();
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(messageInput));
        input.clear();
        input.sendKeys(message);
        WebElement send = wait.until(ExpectedConditions.presenceOfElementLocated(sendButton));
        try {
            send.click();
        } catch (Exception e) {
            ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", send);
        }
    }

    public void sendMessageViaEnter(String message) {
        openChatbot();
        WebElement input = wait.until(ExpectedConditions.visibilityOfElementLocated(messageInput));
        input.clear();
        input.sendKeys(message + Keys.ENTER);
    }

    public void waitForReply() {
        try {
            WebDriverWait shortWait = new WebDriverWait(driver, Duration.ofMillis(800));
            try {
                shortWait.until(ExpectedConditions.visibilityOfElementLocated(loadingIndicator));
            } catch (Exception ignored) {
            }
            wait.until(ExpectedConditions.invisibilityOfElementLocated(loadingIndicator));
        } catch (Exception ignored) {
        }
    }

    public String getLastMessageText() {
        List<WebElement> msgElements = wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(messages));
        if (msgElements.isEmpty()) {
            return "";
        }
        return msgElements.getLast().getText();
    }

    public int getMessageCount() {
        return driver.findElements(messages).size();
    }

    public void clickQuickAction(String actionLabel) {
        openChatbot();
        By quickActionBtn = By.xpath("//button[contains(., '" + actionLabel + "')]");
        WebElement btn = wait.until(ExpectedConditions.presenceOfElementLocated(quickActionBtn));
        try {
            wait.until(ExpectedConditions.elementToBeClickable(btn)).click();
        } catch (Exception e) {
            ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", btn);
        }
    }

    public void startNewConversation() {
        openChatbot();
        WebElement newConv = wait.until(ExpectedConditions.presenceOfElementLocated(newConversationButton));
        try {
            wait.until(ExpectedConditions.elementToBeClickable(newConv)).click();
        } catch (Exception e) {
            ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", newConv);
        }
    }

    public boolean hasErrorMessage() {
        try {
            return !driver.findElements(errorBanner).isEmpty() && driver.findElement(errorBanner).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public String getErrorMessageText() {
        if (hasErrorMessage()) {
            return driver.findElement(errorBanner).getText();
        }
        return "";
    }

    public boolean hasWebSearchStatus() {
        try {
            return !driver.findElements(webSearchStatus).isEmpty() && driver.findElement(webSearchStatus).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public String getWebSearchStatusText() {
        if (hasWebSearchStatus()) {
            return driver.findElement(webSearchStatus).getText();
        }
        return "";
    }

    public boolean hasSources() {
        try {
            return !driver.findElements(sourcesSection).isEmpty() && driver.findElement(sourcesSection).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public int getSourceCount() {
        return driver.findElements(sourceCards).size();
    }

    public List<String> getSourceTitles() {
        return driver.findElements(sourceCards).stream()
                .map(WebElement::getText)
                .toList();
    }

    public String getFirstSourceLinkHref() {
        List<WebElement> links = driver.findElements(sourceLinks);
        return links.isEmpty() ? "" : links.get(0).getAttribute("href");
    }

    public String getFirstSourceLinkTarget() {
        List<WebElement> links = driver.findElements(sourceLinks);
        return links.isEmpty() ? "" : links.get(0).getAttribute("target");
    }

    public String getFirstSourceLinkRel() {
        List<WebElement> links = driver.findElements(sourceLinks);
        return links.isEmpty() ? "" : links.get(0).getAttribute("rel");
    }
}
