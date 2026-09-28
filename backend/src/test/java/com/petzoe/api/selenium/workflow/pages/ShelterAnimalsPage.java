package com.petzoe.api.selenium.workflow.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.List;

public class ShelterAnimalsPage {

    private final WebDriver driver;
    private final WebDriverWait wait;

    private final By recordIntakeBtn = By.xpath("//button[contains(., 'Record Intake')]");
    private final By nameInput = By.xpath("//input[@placeholder='Name (if known)']");
    private final By speciesInput = By.xpath("//input[@placeholder='Species (e.g. Dog, Cat)']");
    private final By breedInput = By.xpath("//input[@placeholder='Breed (if known)']");
    private final By sexSelect = By.xpath("//form//select[option[@value='MALE']]");
    private final By ageInput = By.xpath("//input[@placeholder='Estimated age (months)']");
    private final By colorInput = By.xpath("//input[@placeholder='Colour']");
    private final By weightInput = By.xpath("//input[@placeholder='Weight (kg)']");
    private final By fileUploadInput = By.xpath("//form//input[@type='file']");
    private final By sourceInfoInput = By.xpath("//textarea[@placeholder='Source / rescue information']");
    private final By submitIntakeBtn = By.xpath("//form//button[@type='submit'][contains(., 'Record Intake')]");
    private final By animalCardItems = By.xpath("//div[contains(@class, 'cursor-pointer') and .//p[contains(@class, 'font-bold')]]");

    public ShelterAnimalsPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
    }

    public boolean isLoaded() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//h3[contains(text(), 'Animals')]"))).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public int getAnimalsCount() {
        try {
            wait.until(ExpectedConditions.presenceOfElementLocated(animalCardItems));
            return driver.findElements(animalCardItems).size();
        } catch (Exception e) {
            return 0;
        }
    }

    public void openRecordIntakeModal() {
        WebElement btn = wait.until(ExpectedConditions.elementToBeClickable(recordIntakeBtn));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", btn);
        btn.click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(speciesInput));
    }

    public void fillAndSubmitIntake(String name, String species, String breed, String sex,
                                    String ageMonths, String color, String weightKg,
                                    String sourceInfo, String photoPath) {
        if (name != null && !name.isEmpty()) {
            WebElement nameEl = driver.findElement(nameInput);
            nameEl.clear();
            nameEl.sendKeys(name);
        }

        if (species != null && !species.isEmpty()) {
            WebElement speciesEl = driver.findElement(speciesInput);
            speciesEl.clear();
            speciesEl.sendKeys(species);
        }

        if (breed != null && !breed.isEmpty()) {
            WebElement breedEl = driver.findElement(breedInput);
            breedEl.clear();
            breedEl.sendKeys(breed);
        }

        if (sex != null && !sex.isEmpty()) {
            try {
                Select sel = new Select(driver.findElement(sexSelect));
                sel.selectByValue(sex.toUpperCase());
            } catch (Exception ignored) {}
        }

        if (ageMonths != null && !ageMonths.isEmpty()) {
            WebElement ageEl = driver.findElement(ageInput);
            ageEl.clear();
            ageEl.sendKeys(ageMonths);
        }

        if (color != null && !color.isEmpty()) {
            WebElement colorEl = driver.findElement(colorInput);
            colorEl.clear();
            colorEl.sendKeys(color);
        }

        if (weightKg != null && !weightKg.isEmpty()) {
            WebElement weightEl = driver.findElement(weightInput);
            weightEl.clear();
            weightEl.sendKeys(weightKg);
        }

        if (photoPath != null && !photoPath.isEmpty()) {
            try {
                WebElement fileEl = driver.findElement(fileUploadInput);
                fileEl.sendKeys(photoPath);
            } catch (Exception e) {
                System.out.println("File upload sendKeys note: " + e.getMessage());
            }
        }

        if (sourceInfo != null && !sourceInfo.isEmpty()) {
            WebElement srcEl = driver.findElement(sourceInfoInput);
            srcEl.clear();
            srcEl.sendKeys(sourceInfo);
        }

        WebElement submitBtn = wait.until(ExpectedConditions.elementToBeClickable(submitIntakeBtn));
        ((JavascriptExecutor) driver).executeScript("arguments[0].scrollIntoView({block: 'center'});", submitBtn);
        try {
            submitBtn.click();
        } catch (Exception e) {
            ((JavascriptExecutor) driver).executeScript("arguments[0].click();", submitBtn);
        }
    }

    public boolean hasAnimalWithName(String animalName) {
        try {
            By itemXpath = By.xpath(String.format(
                    "//div[contains(@class, 'cursor-pointer')]//p[contains(text(), '%s')]", animalName));
            return wait.until(ExpectedConditions.visibilityOfElementLocated(itemXpath)).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }

    public void selectAnimal(String animalName) {
        By itemXpath = By.xpath(String.format(
                "//div[contains(@class, 'cursor-pointer')][.//p[contains(text(), '%s')]]", animalName));
        WebElement item = wait.until(ExpectedConditions.elementToBeClickable(itemXpath));
        item.click();
    }

    public boolean isAnimalDetailOpen() {
        try {
            return wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.xpath("//h3[contains(@class, 'font-black') or contains(text(), 'Initial Assessment') or contains(text(), 'Intake Details')]"))).isDisplayed();
        } catch (Exception e) {
            return false;
        }
    }
}
