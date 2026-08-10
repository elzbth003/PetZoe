package com.petzoe.api.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "pets")
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String species;

    @Column(nullable = false)
    private String breed;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false)
    private Double weight;

    @Column(name = "vaccination_status", nullable = false)
    private String vaccinationStatus; // "Up-to-date", "Needs Vaccination", "Overdue"

    @Column(name = "photo_url", length = 512)
    private String photoUrl;

    // Extended fields
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column
    private String color;

    @Column(length = 1024)
    private String allergies;

    @Column(name = "medical_notes", length = 2048)
    private String medicalNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    public Pet() {}

    public Pet(String name, String species, String breed, Integer age, String gender,
               Double weight, String vaccinationStatus, String photoUrl,
               LocalDate dateOfBirth, String color, String allergies, String medicalNotes,
               User owner) {
        this.name = name;
        this.species = species;
        this.breed = breed;
        this.age = age;
        this.gender = gender;
        this.weight = weight;
        this.vaccinationStatus = vaccinationStatus;
        this.photoUrl = photoUrl;
        this.dateOfBirth = dateOfBirth;
        this.color = color;
        this.allergies = allergies;
        this.medicalNotes = medicalNotes;
        this.owner = owner;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSpecies() { return species; }
    public void setSpecies(String species) { this.species = species; }

    public String getBreed() { return breed; }
    public void setBreed(String breed) { this.breed = breed; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public Double getWeight() { return weight; }
    public void setWeight(Double weight) { this.weight = weight; }

    public String getVaccinationStatus() { return vaccinationStatus; }
    public void setVaccinationStatus(String vaccinationStatus) { this.vaccinationStatus = vaccinationStatus; }

    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }

    public String getMedicalNotes() { return medicalNotes; }
    public void setMedicalNotes(String medicalNotes) { this.medicalNotes = medicalNotes; }

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }
}
