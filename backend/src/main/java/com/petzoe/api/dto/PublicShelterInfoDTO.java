package com.petzoe.api.dto;

import com.petzoe.api.entity.Shelter;

/** Deliberately minimal — no registration number, documents, or manager contact info. */
public class PublicShelterInfoDTO {
    private String name;
    private String city;
    private String state;
    private String description;

    public PublicShelterInfoDTO() {}

    public PublicShelterInfoDTO(Shelter shelter) {
        this.name = shelter.getShelterName();
        this.city = shelter.getCity();
        this.state = shelter.getState();
        this.description = shelter.getDescription();
    }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
