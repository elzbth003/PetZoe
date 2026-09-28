package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class RehomingBoardPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By heading = By.xpath("//h1[contains(text(), 'Find a Loving Home') or contains(text(), 'Rehoming')] | //span[contains(text(), 'Community Pet Rehoming')]");
    private final By searchInput = By.xpath("//input[contains(@placeholder, 'Search by pet name')]");
    private final By speciesFilters = By.xpath("//button[text()='All' or text()='Dog' or text()='Cat']");
    private final By applyButtons = By.xpath("//button[contains(., 'Apply to Adopt')] | //span[contains(., 'Your Pet')]");
    private final By applicationModal = By.xpath("//h3[contains(text(), 'Adoption Application') or contains(text(), 'Rehome Application') or contains(text(), 'Apply')]");

    public RehomingBoardPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(heading)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void filterBySpecies(String species) {
        By locator = By.xpath(String.format("//button[text()='%s']", species));
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(locator));
        btn.click();
    }

    public int getListingsOrApplyButtonsCount() {
        try {
            List<WebElement> buttons = wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(applyButtons));
            return buttons.size();
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean clickFirstAvailableApplyButton() {
        try {
            List<WebElement> applyBtns = driver.findElements(By.xpath("//button[contains(., 'Apply to Adopt')]"));
            if (!applyBtns.isEmpty()) {
                applyBtns.get(0).click();
                return wait.until(ExpectedConditions.visibilityOfElementLocated(applicationModal)).isDisplayed();
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }
}
