package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class PetManagementPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By addPetButton = By.xpath("//button[contains(., 'Add New Pet') or contains(., 'Add Pet Now')]");
    private final By modalHeader = By.xpath("//h3[contains(text(), 'Register New Patient Pet') or contains(text(), 'Register New Pet')]");
    private final By petNameInput = By.id("pet-name");
    private final By petSpeciesSelect = By.id("pet-species");
    private final By petBreedInput = By.id("pet-breed");
    private final By petAgeInput = By.id("pet-age");
    private final By petGenderSelect = By.id("pet-gender");
    private final By petWeightInput = By.id("pet-weight");
    private final By petVaccinationSelect = By.id("pet-vaccinationStatus");
    private final By submitRegisterButton = By.xpath("//button[contains(., 'Register Pet')]");
    private final By petCards = By.xpath("//*[contains(@class, 'rounded-') and (.//*[contains(text(), 'PZ-PET-') or .//*[contains(text(), 'Pet ID')]])]");
    private final By petCodeBadges = By.xpath("//*[contains(text(), 'PZ-PET-')]");

    public PetManagementPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(addPetButton)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public int getPetCardsCount() {
        try {
            List<WebElement> badges = wait.until(ExpectedConditions.presenceOfAllElementsLocatedBy(petCodeBadges));
            return badges.size();
        } catch (Exception e) {
            return 0;
        }
    }

    public boolean hasPetWithName(String name) {
        try {
            By locator = By.xpath(String.format("//h3[contains(., '%s')] | //h4[contains(., '%s')]", name, name));
            return wait.until(ExpectedConditions.visibilityOfElementLocated(locator)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void openAddPetModal() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(addPetButton));
        btn.click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(modalHeader));
    }

    public void submitEmptyPetForm() {
        WebElement submit = wait.until(ExpectedConditions.elementToBeClickable(submitRegisterButton));
        submit.click();
    }

    public boolean hasValidationErrors() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//p[contains(text(), 'must be at least') or contains(text(), 'is required') or contains(text(), 'cannot be')]"))).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void fillAndSubmitPet(String name, String species, String breed, String age, String gender, String weight, String vaccinationStatus) {
        WebElement nameEl = wait.until(ExpectedConditions.visibilityOfElementLocated(petNameInput));
        nameEl.clear();
        nameEl.sendKeys(name);

        new Select(driver.findElement(petSpeciesSelect)).selectByVisibleText(species);

        WebElement breedEl = driver.findElement(petBreedInput);
        breedEl.clear();
        breedEl.sendKeys(breed);

        WebElement ageEl = driver.findElement(petAgeInput);
        ageEl.clear();
        ageEl.sendKeys(age);

        new Select(driver.findElement(petGenderSelect)).selectByVisibleText(gender);

        WebElement weightEl = driver.findElement(petWeightInput);
        weightEl.clear();
        weightEl.sendKeys(weight);

        new Select(driver.findElement(petVaccinationSelect)).selectByVisibleText(vaccinationStatus);

        driver.findElement(submitRegisterButton).click();
        try {
            wait.until(ExpectedConditions.invisibilityOfElementLocated(modalHeader));
        } catch (Exception ignored) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException ignored2) {
            }
        }
    }

    public void fillPetFields(String name, String breed, String age, String weight) {
        WebElement nameEl = wait.until(ExpectedConditions.visibilityOfElementLocated(petNameInput));
        nameEl.clear();
        nameEl.sendKeys(name);

        WebElement breedEl = driver.findElement(petBreedInput);
        breedEl.clear();
        breedEl.sendKeys(breed);

        WebElement ageEl = driver.findElement(petAgeInput);
        ageEl.clear();
        ageEl.sendKeys(age);

        WebElement weightEl = driver.findElement(petWeightInput);
        weightEl.clear();
        weightEl.sendKeys(weight);
    }

    public void clickRegisterButton() {
        WebElement btn = wait.until(ExpectedConditions.presenceOfElementLocated(submitRegisterButton));
        ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
        try {
            wait.until(ExpectedConditions.elementToBeClickable(btn)).click();
        } catch (Exception e) {
            ((org.openqa.selenium.JavascriptExecutor) driver).executeScript("arguments[0].click();", btn);
        }
    }

    public boolean hasSpecificError(String textSnippet) {
        try {
            By errLocator = By.xpath(String.format("//p[contains(text(), '%s')]", textSnippet));
            return wait.until(ExpectedConditions.visibilityOfElementLocated(errLocator)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
}
