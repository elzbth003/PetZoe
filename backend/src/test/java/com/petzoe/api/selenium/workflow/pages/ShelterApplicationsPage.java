package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class ShelterApplicationsPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By applicationsHeader = By.xpath("//h3[contains(text(), 'Adoption Applications')]");
    private final By applicationCards = By.xpath("//div[contains(@class, 'cursor-pointer') and .//p[contains(text(), 'Applicant:')]]");
    private final By detailHeader = By.xpath("//h3[contains(text(), 'Application for')]");
    private final By applicantDetailsBox = By.xpath("//p[contains(., 'Applicant')]/parent::div");
    private final By adopterProfileBox = By.xpath("//p[contains(., 'Adopter Profile')]/parent::div");

    public ShelterApplicationsPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(applicationsHeader)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public int getApplicationsCount() {
        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(applicationCards));
            return driver.findElements(applicationCards).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public void selectApplication(int index) {
        List<WebElement> cards = wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(applicationCards));
        if (index < cards.size()) {
            WebElement card = cards.get(index);
            ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", card);
            card.click();
            wait.until(ExpectedConditions.visibilityOfElementLocated(detailHeader));
        }
    }

    public void selectApplicationForAnimal(String animalName) {
        By cardXpath = By.xpath(String.format(
                "//div[contains(@class, 'cursor-pointer')][.//p[contains(text(), '%s')]]", animalName));
        WebElement card = wait.until(ExpectedConditions.elementToBeClickable(cardXpath));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", card);
        card.click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(detailHeader));
    }

    public boolean isApplicationDetailOpen() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(detailHeader)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public String getApplicantInfoText() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(applicantDetailsBox)).getText();
        } catch (Exception e) {
            return "";
        }
    }

    public String getAdopterProfileText() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(adopterProfileBox)).getText();
        } catch (Exception e) {
            return "";
        }
    }
}
