package com.petzoe.api.dto;

public class AdminStatsDTO {
    private long totalUsers;
    private long totalPetOwners;
    private long pendingVets;
    private long verifiedVets;
    private long pendingShelters;
    private long pendingSellers;
    private long pendingProducts;
    private long activeAdoptionPets;

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalPetOwners() { return totalPetOwners; }
    public void setTotalPetOwners(long totalPetOwners) { this.totalPetOwners = totalPetOwners; }

    public long getPendingVets() { return pendingVets; }
    public void setPendingVets(long pendingVets) { this.pendingVets = pendingVets; }

    public long getVerifiedVets() { return verifiedVets; }
    public void setVerifiedVets(long verifiedVets) { this.verifiedVets = verifiedVets; }

    public long getPendingShelters() { return pendingShelters; }
    public void setPendingShelters(long pendingShelters) { this.pendingShelters = pendingShelters; }

    public long getPendingSellers() { return pendingSellers; }
    public void setPendingSellers(long pendingSellers) { this.pendingSellers = pendingSellers; }

    public long getPendingProducts() { return pendingProducts; }
    public void setPendingProducts(long pendingProducts) { this.pendingProducts = pendingProducts; }

    public long getActiveAdoptionPets() { return activeAdoptionPets; }
    public void setActiveAdoptionPets(long activeAdoptionPets) { this.activeAdoptionPets = activeAdoptionPets; }
}
