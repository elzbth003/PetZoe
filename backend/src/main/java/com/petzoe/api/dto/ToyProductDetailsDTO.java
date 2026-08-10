package com.petzoe.api.dto;

public class ToyProductDetailsDTO {
    private String toyType;
    private String petType;
    private String recommendedAge;
    private String petSize;
    private String material;
    private String dimensions;
    private String weight;
    private String color;
    private Boolean interactive;
    private Boolean chewResistant;
    private Boolean washable;
    private String indoorOutdoor;
    private String safetyInstructions;

    // Getters and Setters
    public String getToyType() { return toyType; }
    public void setToyType(String toyType) { this.toyType = toyType; }
    public String getPetType() { return petType; }
    public void setPetType(String petType) { this.petType = petType; }
    public String getRecommendedAge() { return recommendedAge; }
    public void setRecommendedAge(String recommendedAge) { this.recommendedAge = recommendedAge; }
    public String getPetSize() { return petSize; }
    public void setPetSize(String petSize) { this.petSize = petSize; }
    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }
    public String getDimensions() { return dimensions; }
    public void setDimensions(String dimensions) { this.dimensions = dimensions; }
    public String getWeight() { return weight; }
    public void setWeight(String weight) { this.weight = weight; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public Boolean getInteractive() { return interactive; }
    public void setInteractive(Boolean interactive) { this.interactive = interactive; }
    public Boolean getChewResistant() { return chewResistant; }
    public void setChewResistant(Boolean chewResistant) { this.chewResistant = chewResistant; }
    public Boolean getWashable() { return washable; }
    public void setWashable(Boolean washable) { this.washable = washable; }
    public String getIndoorOutdoor() { return indoorOutdoor; }
    public void setIndoorOutdoor(String indoorOutdoor) { this.indoorOutdoor = indoorOutdoor; }
    public String getSafetyInstructions() { return safetyInstructions; }
    public void setSafetyInstructions(String safetyInstructions) { this.safetyInstructions = safetyInstructions; }
}
